import React, { useState, useEffect } from 'react';
import { Effect } from '../engine/effects/Effect';
import { MidiManager } from '../services/MidiManager';
import { LFOManager } from '../engine/modulation/LFOManager';
import { AudioReactiveManager, AudioFeature } from '../engine/modulation/AudioReactiveManager';

interface ParameterPanelProps {
    effect: Effect | null;
    midiManager: MidiManager;
    lfoManager?: LFOManager;
    audioReactiveManager?: AudioReactiveManager;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ effect, midiManager, lfoManager, audioReactiveManager }) => {
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

    useEffect(() => {
        if (audioReactiveManager) {
            const unsubscribe = audioReactiveManager.onChange(() => setTick(t => t + 1));
            return unsubscribe;
        }
    }, [audioReactiveManager]);

    if (!effect) {
        return (
            <div className="console-panel" style={{ height: '100%' }}>
                <div className="console-panel-header">
                    <span>Parameters</span>
                    <div className="led-indicator" />
                </div>
                <div className="console-panel-content" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}>
                    <div style={{
                        color: 'var(--vm-text-dim)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-label)',
                        letterSpacing: '0.05em',
                    }}>
                        SELECT AN EFFECT
                        <br />
                        <span style={{ fontSize: '10px', opacity: 0.6 }}>to edit parameters</span>
                    </div>
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

    const handleAudioMap = (paramId: string, feature: AudioFeature | '', min: number, max: number) => {
        if (!audioReactiveManager) return;

        if (feature === '') {
            audioReactiveManager.unmapParameter(effect.id, paramId);
        } else {
            audioReactiveManager.mapParameter(feature, effect.id, paramId, min, max);
        }
        setTick(t => t + 1);
    };

    return (
        <div className="console-panel" style={{ height: '100%' }}>
            <div className="console-panel-header">
                <span>{effect.name}</span>
                <div className="led-indicator active" />
            </div>

            <div className="console-panel-content">
                {effect.parameters.length === 0 && (
                    <div style={{
                        color: 'var(--vm-text-dim)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-label)',
                        textAlign: 'center',
                        padding: '16px',
                    }}>
                        NO PARAMETERS
                    </div>
                )}

                {effect.parameters.map(param => {
                    const isModulated = lfoManager?.isParameterModulated(effect.id, param.id);
                    const mapping = lfoManager?.getMappingForParameter(effect.id, param.id);
                    const modulatingLfo = mapping ? lfoManager?.getLFO(mapping.lfoId) : null;

                    const audioMapping = audioReactiveManager?.getMappingForParameter(effect.id, param.id);
                    const isAudioModulated = !!audioMapping;

                    const currentValue = effect.uniforms[param.id]?.value;

                    return (
                        <div key={param.id} style={{
                            marginBottom: '12px',
                            padding: '10px',
                            background: 'var(--vm-enclosure-dark)',
                            borderRadius: '4px',
                            border: '1px solid var(--vm-panel-border)',
                        }}>
                            {/* Parameter Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                            }}>
                                <label style={{
                                    fontFamily: 'var(--font-label)',
                                    fontSize: '10px',
                                    color: 'var(--vm-silkscreen)',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    {param.label}
                                    {isModulated && (
                                        <span style={{
                                            background: 'var(--vm-accent-warning)',
                                            padding: '2px 6px',
                                            borderRadius: '2px',
                                            fontSize: '9px',
                                            color: '#000',
                                            fontWeight: '600',
                                        }}>
                                            LFO: {modulatingLfo?.name}
                                        </span>
                                    )}
                                    {isAudioModulated && (
                                        <span style={{
                                            background: 'var(--vm-accent-primary)',
                                            padding: '2px 6px',
                                            borderRadius: '2px',
                                            fontSize: '9px',
                                            color: '#000',
                                            fontWeight: '600',
                                        }}>
                                            AUDIO: {audioMapping?.feature.toUpperCase()}
                                        </span>
                                    )}
                                </label>
                                <button
                                    onClick={() => handleLearn(param.id, param.min || 0, param.max || 1)}
                                    className="vm-button"
                                    style={{
                                        fontSize: '9px',
                                        padding: '3px 8px',
                                        background: learningParam === param.id
                                            ? 'var(--vm-accent-danger)'
                                            : 'var(--vm-enclosure-mid)',
                                    }}
                                >
                                    {learningParam === param.id ? 'LISTENING...' : 'MIDI'}
                                </button>
                            </div>

                            {/* Float Parameter - Fader style slider */}
                            {param.type === 'float' && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}>
                                    {/* Fader Track */}
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            type="range"
                                            min={param.min}
                                            max={param.max}
                                            step={param.step || 0.01}
                                            value={typeof currentValue === 'number' ? currentValue : 0}
                                            onChange={(e) => handleChange(param.id, parseFloat(e.target.value))}
                                            disabled={isModulated || isAudioModulated}
                                            className="vm-fader"
                                            style={{
                                                opacity: (isModulated || isAudioModulated) ? 0.5 : 1,
                                            }}
                                        />
                                    </div>

                                    {/* LCD Value Display */}
                                    <div className="vm-lcd vm-lcd-small" style={{
                                        minWidth: '52px',
                                        textAlign: 'right',
                                        fontSize: '13px',
                                        padding: '3px 6px',
                                    }}>
                                        {typeof currentValue === 'number'
                                            ? currentValue.toFixed(2)
                                            : '0.00'}
                                    </div>
                                </div>
                            )}

                            {/* Boolean Parameter - Toggle button */}
                            {param.type === 'boolean' && (
                                <button
                                    onClick={() => handleChange(param.id, !currentValue)}
                                    className={`vm-button vm-button-led ${currentValue ? 'active' : ''}`}
                                    style={{
                                        width: '100%',
                                        background: currentValue
                                            ? 'linear-gradient(180deg, var(--vm-accent-success) 0%, #228833 100%)'
                                            : 'linear-gradient(180deg, var(--vm-enclosure-mid) 0%, var(--vm-enclosure-dark) 100%)',
                                    }}
                                >
                                    {currentValue ? 'ON' : 'OFF'}
                                </button>
                            )}

                            {/* Audio Modulation Selector */}
                            {param.type === 'float' && !isModulated && (
                                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', color: 'var(--vm-text-dim)' }}>AUDIO MOD:</span>
                                    <select
                                        className="vm-select"
                                        style={{ fontSize: '9px', padding: '2px', width: 'auto', flex: 1 }}
                                        value={audioMapping?.feature || ''}
                                        onChange={(e) => handleAudioMap(param.id, e.target.value as AudioFeature | '', param.min || 0, param.max || 1)}
                                    >
                                        <option value="">None</option>
                                        <option value="bass">Bass</option>
                                        <option value="mid">Mid</option>
                                        <option value="treble">Treble</option>
                                        <option value="vol">Volume</option>
                                    </select>
                                </div>
                            )}

                            {/* Remove LFO mapping button */}
                            {isModulated && (
                                <button
                                    onClick={() => lfoManager?.unmapParameter(effect.id, param.id)}
                                    className="vm-button"
                                    style={{
                                        marginTop: '8px',
                                        fontSize: '9px',
                                        padding: '4px 8px',
                                        background: 'var(--vm-accent-danger)',
                                        width: '100%',
                                    }}
                                >
                                    REMOVE LFO
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
