import React, { useState, useEffect } from 'react';
import { Effect } from '../engine/effects/Effect';
import { MidiManager } from '../services/MidiManager';
import { LFOManager } from '../engine/modulation/LFOManager';

interface ParameterPanelProps {
    effect: Effect | null;
    midiManager: MidiManager;
    lfoManager?: LFOManager;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ effect, midiManager, lfoManager }) => {
    const [, setTick] = useState(0);
    const [learningParam, setLearningParam] = useState<string | null>(null);

    useEffect(() => {
        setTick(t => t + 1);
    }, [effect]);

    useEffect(() => {
        if (lfoManager) {
            const unsubscribe = lfoManager.onChange(() => setTick(t => t + 1));
            return unsubscribe;
        }
    }, [lfoManager]);

    if (!effect) {
        return (
            <div style={{ width: '250px', background: '#222', color: '#eee', padding: '10px', borderLeft: '1px solid #444' }}>
                <div style={{ color: '#666', textAlign: 'center', paddingTop: '20px' }}>
                    Select an effect to edit its parameters
                </div>
            </div>
        );
    }

    const handleChange = (id: string, value: number | string | boolean) => {
        effect.setParameter(id, value);
        setTick(t => t + 1);
    };

    const handleLearn = (paramId: string, min: number, max: number) => {
        setLearningParam(paramId);
        midiManager.learn((midiId) => {
            console.log(`Mapped ${midiId} to ${paramId}`);
            midiManager.map(midiId, (val) => {
                const scaled = val * (max - min) + min;
                handleChange(paramId, scaled);
            });
            setLearningParam(null);
        });
    };

    return (
        <div style={{ width: '250px', background: '#222', color: '#eee', padding: '10px', borderLeft: '1px solid #444' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1em', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                {effect.name}
            </h3>
            {effect.parameters.length === 0 && (
                <div style={{ color: '#666', fontSize: '0.9em' }}>No parameters available</div>
            )}
            {effect.parameters.map(param => {
                const isModulated = lfoManager?.isParameterModulated(effect.id, param.id);
                const mapping = lfoManager?.getMappingForParameter(effect.id, param.id);
                const modulatingLfo = mapping ? lfoManager?.getLFO(mapping.lfoId) : null;

                return (
                    <div key={param.id} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {param.label}
                                {isModulated && (
                                    <span
                                        title={`Modulated by ${modulatingLfo?.name || 'LFO'}`}
                                        style={{
                                            background: '#664',
                                            padding: '1px 5px',
                                            borderRadius: '3px',
                                            fontSize: '0.7em',
                                            color: '#ffa',
                                        }}
                                    >
                                        ⟳ {modulatingLfo?.name}
                                    </span>
                                )}
                            </label>
                            <button
                                onClick={() => handleLearn(param.id, param.min || 0, param.max || 1)}
                                style={{
                                    fontSize: '0.7em',
                                    background: learningParam === param.id ? '#c44' : '#444',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '3px 6px',
                                    borderRadius: '2px',
                                }}
                            >
                                {learningParam === param.id ? '🎹 Listening...' : '🎹 Learn'}
                            </button>
                        </div>
                        {param.type === 'float' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="range"
                                    min={param.min}
                                    max={param.max}
                                    step={param.step || 0.01}
                                    value={effect.uniforms[param.id]?.value || 0}
                                    onChange={(e) => handleChange(param.id, parseFloat(e.target.value))}
                                    disabled={isModulated}
                                    style={{
                                        flex: 1,
                                        opacity: isModulated ? 0.5 : 1,
                                    }}
                                />
                                <span style={{
                                    fontSize: '0.8em',
                                    width: '40px',
                                    textAlign: 'right',
                                    fontFamily: 'monospace',
                                }}>
                                    {typeof effect.uniforms[param.id]?.value === 'number'
                                        ? effect.uniforms[param.id].value.toFixed(2)
                                        : '0.00'}
                                </span>
                            </div>
                        )}
                        {param.type === 'boolean' && (
                            <button
                                onClick={() => handleChange(param.id, !effect.uniforms[param.id]?.value)}
                                style={{
                                    background: effect.uniforms[param.id]?.value ? '#4a4' : '#444',
                                    border: 'none',
                                    color: 'white',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                }}
                            >
                                {effect.uniforms[param.id]?.value ? 'ON' : 'OFF'}
                            </button>
                        )}
                        {isModulated && (
                            <button
                                onClick={() => lfoManager?.unmapParameter(effect.id, param.id)}
                                style={{
                                    marginTop: '4px',
                                    fontSize: '0.7em',
                                    background: '#633',
                                    border: 'none',
                                    color: '#faa',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    borderRadius: '2px',
                                }}
                            >
                                Remove LFO
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
