import React, { useState, useEffect } from 'react';
import { LFOManager } from '../engine/modulation/LFOManager';
import { LFO, LFOWaveform } from '../engine/modulation/LFO';
import { Effect } from '../engine/effects/Effect';

interface LFOPanelProps {
    lfoManager: LFOManager;
    effects: Effect[];
    onUpdate: () => void;
}

const waveformOptions: { value: LFOWaveform; label: string; icon: string }[] = [
    { value: 'sine', label: 'Sine', icon: '∿' },
    { value: 'square', label: 'Square', icon: '⊓' },
    { value: 'saw', label: 'Saw', icon: '⋰' },
    { value: 'triangle', label: 'Triangle', icon: '△' },
    { value: 'random', label: 'Random', icon: '?' },
];

// Reserved for future use when mode selection UI is added
// const modeOptions: { value: ModulationMode; label: string }[] = [
//     { value: 'replace', label: 'Replace' },
//     { value: 'add', label: 'Add' },
//     { value: 'multiply', label: 'Multiply' },
// ];

export const LFOPanel: React.FC<LFOPanelProps> = ({ lfoManager, effects, onUpdate }) => {
    const [, setTick] = useState(0);
    const [selectedLfoId, setSelectedLfoId] = useState<string | null>(null);
    const [mappingMode, setMappingMode] = useState(false);
    const [mappingLfoId, setMappingLfoId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = lfoManager.onChange(() => setTick(t => t + 1));
        return unsubscribe;
    }, [lfoManager]);

    const selectedLfo = selectedLfoId ? lfoManager.getLFO(selectedLfoId) : null;

    const handleCreateLFO = () => {
        const lfo = lfoManager.createLFO();
        setSelectedLfoId(lfo.id);
        onUpdate();
    };

    const handleDeleteLFO = (id: string) => {
        lfoManager.removeLFO(id);
        if (selectedLfoId === id) setSelectedLfoId(null);
        onUpdate();
    };

    const handleLFOChange = (lfo: LFO, key: keyof LFO, value: number | string | boolean) => {
        (lfo as unknown as Record<string, unknown>)[key] = value;
        onUpdate();
        setTick(t => t + 1);
    };

    const startMapping = (lfoId: string) => {
        setMappingMode(true);
        setMappingLfoId(lfoId);
    };

    const cancelMapping = () => {
        setMappingMode(false);
        setMappingLfoId(null);
    };

    const handleMapParameter = (effectId: string, parameterId: string, min: number, max: number) => {
        if (mappingLfoId) {
            lfoManager.mapToParameter(mappingLfoId, effectId, parameterId, min, max);
            cancelMapping();
            onUpdate();
        }
    };

    const handleUnmapParameter = (effectId: string, parameterId: string) => {
        lfoManager.unmapParameter(effectId, parameterId);
        onUpdate();
    };

    return (
        <div style={{
            background: '#1a1a2e',
            color: '#eee',
            padding: '10px',
            borderTop: '1px solid #444',
            maxHeight: '300px',
            overflowY: 'auto',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1em' }}>⏱️ LFOs</h3>
                <button
                    onClick={handleCreateLFO}
                    style={{
                        background: '#4a4',
                        border: 'none',
                        color: 'white',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '0.8em',
                    }}
                >
                    + Add LFO
                </button>
            </div>

            {/* LFO List */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {lfoManager.lfos.map(lfo => (
                    <div
                        key={lfo.id}
                        onClick={() => setSelectedLfoId(lfo.id)}
                        style={{
                            padding: '6px 10px',
                            background: selectedLfoId === lfo.id ? '#444' : '#333',
                            border: selectedLfoId === lfo.id ? '1px solid #666' : '1px solid transparent',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            opacity: lfo.enabled ? 1 : 0.5,
                        }}
                    >
                        <span style={{ marginRight: '5px' }}>
                            {waveformOptions.find(w => w.value === lfo.waveform)?.icon}
                        </span>
                        {lfo.name}
                    </div>
                ))}
            </div>

            {lfoManager.lfos.length === 0 && (
                <div style={{ color: '#666', fontSize: '0.9em', textAlign: 'center', padding: '10px' }}>
                    No LFOs created yet. Click "Add LFO" to create one.
                </div>
            )}

            {/* Selected LFO Editor */}
            {selectedLfo && (
                <div style={{ background: '#252540', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={selectedLfo.name}
                            onChange={(e) => handleLFOChange(selectedLfo, 'name', e.target.value)}
                            style={{
                                background: '#333',
                                border: '1px solid #555',
                                color: 'white',
                                padding: '4px',
                                borderRadius: '2px',
                                width: '120px',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => handleLFOChange(selectedLfo, 'enabled', !selectedLfo.enabled)}
                                style={{
                                    background: selectedLfo.enabled ? '#4a4' : '#666',
                                    border: 'none',
                                    color: 'white',
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                    borderRadius: '2px',
                                    fontSize: '0.8em',
                                }}
                            >
                                {selectedLfo.enabled ? 'ON' : 'OFF'}
                            </button>
                            <button
                                onClick={() => handleDeleteLFO(selectedLfo.id)}
                                style={{
                                    background: '#a44',
                                    border: 'none',
                                    color: 'white',
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                    borderRadius: '2px',
                                    fontSize: '0.8em',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Waveform Selector */}
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '0.8em', color: '#888' }}>Waveform</label>
                        <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                            {waveformOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleLFOChange(selectedLfo, 'waveform', opt.value)}
                                    title={opt.label}
                                    style={{
                                        background: selectedLfo.waveform === opt.value ? '#666' : '#444',
                                        border: 'none',
                                        color: 'white',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        borderRadius: '2px',
                                        fontSize: '1em',
                                    }}
                                >
                                    {opt.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parameters */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.8em', color: '#888' }}>Frequency (Hz)</label>
                            <input
                                type="range"
                                min="0.01"
                                max="20"
                                step="0.01"
                                value={selectedLfo.frequency}
                                onChange={(e) => handleLFOChange(selectedLfo, 'frequency', parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: '0.8em' }}>{selectedLfo.frequency.toFixed(2)}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8em', color: '#888' }}>Amplitude</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={selectedLfo.amplitude}
                                onChange={(e) => handleLFOChange(selectedLfo, 'amplitude', parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: '0.8em' }}>{selectedLfo.amplitude.toFixed(2)}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8em', color: '#888' }}>Offset</label>
                            <input
                                type="range"
                                min="-1"
                                max="1"
                                step="0.01"
                                value={selectedLfo.offset}
                                onChange={(e) => handleLFOChange(selectedLfo, 'offset', parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: '0.8em' }}>{selectedLfo.offset.toFixed(2)}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8em', color: '#888' }}>Phase</label>
                            <input
                                type="range"
                                min="0"
                                max={Math.PI * 2}
                                step="0.01"
                                value={selectedLfo.phase}
                                onChange={(e) => handleLFOChange(selectedLfo, 'phase', parseFloat(e.target.value))}
                                style={{ width: '100%' }}
                            />
                            <span style={{ fontSize: '0.8em' }}>{(selectedLfo.phase / Math.PI).toFixed(2)}π</span>
                        </div>
                    </div>

                    {/* Map Button */}
                    <button
                        onClick={() => startMapping(selectedLfo.id)}
                        style={{
                            marginTop: '10px',
                            width: '100%',
                            background: mappingMode && mappingLfoId === selectedLfo.id ? '#a84' : '#448',
                            border: 'none',
                            color: 'white',
                            padding: '8px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                        }}
                    >
                        {mappingMode && mappingLfoId === selectedLfo.id ? 'Click a parameter below...' : '🔗 Map to Parameter'}
                    </button>
                </div>
            )}

            {/* Mapping Target Selection */}
            {mappingMode && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#2a2a3a', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.9em', color: '#aaa' }}>Select a parameter to modulate:</span>
                        <button
                            onClick={cancelMapping}
                            style={{
                                background: '#666',
                                border: 'none',
                                color: 'white',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                borderRadius: '2px',
                                fontSize: '0.8em',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    {effects.map(effect => (
                        <div key={effect.id} style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>{effect.name}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {effect.parameters.filter(p => p.type === 'float').map(param => {
                                    const isModulated = lfoManager.isParameterModulated(effect.id, param.id);
                                    return (
                                        <button
                                            key={param.id}
                                            onClick={() => handleMapParameter(effect.id, param.id, param.min || 0, param.max || 1)}
                                            style={{
                                                background: isModulated ? '#664' : '#444',
                                                border: isModulated ? '1px solid #886' : '1px solid transparent',
                                                color: 'white',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                borderRadius: '2px',
                                                fontSize: '0.8em',
                                            }}
                                        >
                                            {param.label} {isModulated && '⟳'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Current Mappings */}
            {lfoManager.mappings.length > 0 && !mappingMode && (
                <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '5px' }}>Active Mappings:</div>
                    {lfoManager.mappings.map((mapping, idx) => {
                        const lfo = lfoManager.getLFO(mapping.lfoId);
                        const effect = effects.find(e => e.id === mapping.effectId);
                        const param = effect?.parameters.find(p => p.id === mapping.parameterId);
                        if (!lfo || !effect || !param) return null;
                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    background: '#333',
                                    borderRadius: '2px',
                                    marginBottom: '2px',
                                    fontSize: '0.85em',
                                }}
                            >
                                <span>
                                    {lfo.name} → {effect.name}.{param.label}
                                </span>
                                <button
                                    onClick={() => handleUnmapParameter(mapping.effectId, mapping.parameterId)}
                                    style={{
                                        background: '#a44',
                                        border: 'none',
                                        color: 'white',
                                        padding: '2px 6px',
                                        cursor: 'pointer',
                                        borderRadius: '2px',
                                        fontSize: '0.8em',
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
