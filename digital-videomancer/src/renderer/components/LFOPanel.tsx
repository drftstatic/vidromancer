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
    { value: 'sine', label: 'Sine', icon: '~' },
    { value: 'square', label: 'Square', icon: '[]' },
    { value: 'saw', label: 'Saw', icon: '/' },
    { value: 'triangle', label: 'Triangle', icon: '/\\' },
    { value: 'random', label: 'Random', icon: '?' },
];

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
        <div className="console-panel" style={{ maxHeight: '260px' }}>
            <div className="console-panel-header">
                <span>LFO Modulation</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={`led-indicator ${lfoManager.lfos.length > 0 ? 'active' : ''}`} />
                    <button
                        onClick={handleCreateLFO}
                        className="vm-button vm-button-primary"
                        style={{ fontSize: '9px', padding: '4px 8px' }}
                    >
                        + ADD LFO
                    </button>
                </div>
            </div>

            <div className="console-panel-content" style={{ display: 'flex', gap: '8px' }}>
                {/* LFO List */}
                <div style={{
                    width: '120px',
                    borderRight: '1px solid var(--vm-panel-border)',
                    paddingRight: '8px',
                }}>
                    {lfoManager.lfos.length === 0 && (
                        <div style={{
                            color: 'var(--vm-text-dim)',
                            fontSize: '10px',
                            textAlign: 'center',
                            padding: '12px 4px',
                            fontFamily: 'var(--font-label)',
                        }}>
                            NO LFOs
                        </div>
                    )}
                    {lfoManager.lfos.map(lfo => (
                        <div
                            key={lfo.id}
                            onClick={() => setSelectedLfoId(lfo.id)}
                            style={{
                                padding: '6px 8px',
                                background: selectedLfoId === lfo.id
                                    ? 'var(--vm-enclosure-mid)'
                                    : 'transparent',
                                border: selectedLfoId === lfo.id
                                    ? '1px solid var(--vm-enclosure-light)'
                                    : '1px solid transparent',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginBottom: '4px',
                                opacity: lfo.enabled ? 1 : 0.4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontFamily: 'var(--font-label)',
                                fontSize: '10px',
                                letterSpacing: '0.05em',
                            }}
                        >
                            <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '11px',
                                opacity: 0.6,
                            }}>
                                {waveformOptions.find(w => w.value === lfo.waveform)?.icon}
                            </span>
                            {lfo.name}
                        </div>
                    ))}
                </div>

                {/* Selected LFO Editor */}
                <div style={{ flex: 1 }}>
                    {!selectedLfo && (
                        <div style={{
                            color: 'var(--vm-text-dim)',
                            fontSize: '10px',
                            textAlign: 'center',
                            padding: '24px',
                            fontFamily: 'var(--font-label)',
                        }}>
                            SELECT AN LFO
                        </div>
                    )}

                    {selectedLfo && (
                        <div>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px',
                            }}>
                                <input
                                    type="text"
                                    value={selectedLfo.name}
                                    onChange={(e) => handleLFOChange(selectedLfo, 'name', e.target.value)}
                                    className="vm-input"
                                    style={{ width: '100px', fontSize: '11px', padding: '4px 8px' }}
                                />
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => handleLFOChange(selectedLfo, 'enabled', !selectedLfo.enabled)}
                                        className={`vm-button vm-button-led ${selectedLfo.enabled ? 'active' : ''}`}
                                        style={{
                                            fontSize: '9px',
                                            padding: '4px 8px',
                                            background: selectedLfo.enabled
                                                ? 'linear-gradient(180deg, var(--vm-accent-success) 0%, #228833 100%)'
                                                : 'var(--vm-enclosure-mid)',
                                        }}
                                    >
                                        {selectedLfo.enabled ? 'ON' : 'OFF'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLFO(selectedLfo.id)}
                                        className="vm-button vm-button-danger"
                                        style={{ fontSize: '9px', padding: '4px 8px' }}
                                    >
                                        DEL
                                    </button>
                                </div>
                            </div>

                            {/* Waveform Selector */}
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{
                                    fontFamily: 'var(--font-label)',
                                    fontSize: '9px',
                                    color: 'var(--vm-silkscreen-dim)',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    display: 'block',
                                    marginBottom: '4px',
                                }}>
                                    WAVEFORM
                                </label>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                    {waveformOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleLFOChange(selectedLfo, 'waveform', opt.value)}
                                            title={opt.label}
                                            className="vm-button"
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                fontFamily: 'var(--font-mono)',
                                                background: selectedLfo.waveform === opt.value
                                                    ? 'var(--vm-accent-secondary)'
                                                    : 'var(--vm-enclosure-mid)',
                                            }}
                                        >
                                            {opt.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Parameters Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                            }}>
                                {/* Frequency */}
                                <div>
                                    <label style={{
                                        fontFamily: 'var(--font-label)',
                                        fontSize: '9px',
                                        color: 'var(--vm-silkscreen-dim)',
                                        letterSpacing: '0.1em',
                                        display: 'block',
                                        marginBottom: '2px',
                                    }}>
                                        FREQ (HZ)
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="range"
                                            min="0.01"
                                            max="20"
                                            step="0.01"
                                            value={selectedLfo.frequency}
                                            onChange={(e) => handleLFOChange(selectedLfo, 'frequency', parseFloat(e.target.value))}
                                            className="vm-fader"
                                            style={{ flex: 1 }}
                                        />
                                        <span className="vm-lcd vm-lcd-small" style={{
                                            fontSize: '11px',
                                            padding: '2px 4px',
                                            minWidth: '40px',
                                            textAlign: 'right',
                                        }}>
                                            {selectedLfo.frequency.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Amplitude */}
                                <div>
                                    <label style={{
                                        fontFamily: 'var(--font-label)',
                                        fontSize: '9px',
                                        color: 'var(--vm-silkscreen-dim)',
                                        letterSpacing: '0.1em',
                                        display: 'block',
                                        marginBottom: '2px',
                                    }}>
                                        AMPLITUDE
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={selectedLfo.amplitude}
                                            onChange={(e) => handleLFOChange(selectedLfo, 'amplitude', parseFloat(e.target.value))}
                                            className="vm-fader"
                                            style={{ flex: 1 }}
                                        />
                                        <span className="vm-lcd vm-lcd-small" style={{
                                            fontSize: '11px',
                                            padding: '2px 4px',
                                            minWidth: '40px',
                                            textAlign: 'right',
                                        }}>
                                            {selectedLfo.amplitude.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Offset */}
                                <div>
                                    <label style={{
                                        fontFamily: 'var(--font-label)',
                                        fontSize: '9px',
                                        color: 'var(--vm-silkscreen-dim)',
                                        letterSpacing: '0.1em',
                                        display: 'block',
                                        marginBottom: '2px',
                                    }}>
                                        OFFSET
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="range"
                                            min="-1"
                                            max="1"
                                            step="0.01"
                                            value={selectedLfo.offset}
                                            onChange={(e) => handleLFOChange(selectedLfo, 'offset', parseFloat(e.target.value))}
                                            className="vm-fader"
                                            style={{ flex: 1 }}
                                        />
                                        <span className="vm-lcd vm-lcd-small" style={{
                                            fontSize: '11px',
                                            padding: '2px 4px',
                                            minWidth: '40px',
                                            textAlign: 'right',
                                        }}>
                                            {selectedLfo.offset.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Phase */}
                                <div>
                                    <label style={{
                                        fontFamily: 'var(--font-label)',
                                        fontSize: '9px',
                                        color: 'var(--vm-silkscreen-dim)',
                                        letterSpacing: '0.1em',
                                        display: 'block',
                                        marginBottom: '2px',
                                    }}>
                                        PHASE
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input
                                            type="range"
                                            min="0"
                                            max={Math.PI * 2}
                                            step="0.01"
                                            value={selectedLfo.phase}
                                            onChange={(e) => handleLFOChange(selectedLfo, 'phase', parseFloat(e.target.value))}
                                            className="vm-fader"
                                            style={{ flex: 1 }}
                                        />
                                        <span className="vm-lcd vm-lcd-small" style={{
                                            fontSize: '11px',
                                            padding: '2px 4px',
                                            minWidth: '40px',
                                            textAlign: 'right',
                                        }}>
                                            {(selectedLfo.phase / Math.PI).toFixed(1)}pi
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Map Button */}
                            <button
                                onClick={() => startMapping(selectedLfo.id)}
                                className="vm-button"
                                style={{
                                    marginTop: '10px',
                                    width: '100%',
                                    background: mappingMode && mappingLfoId === selectedLfo.id
                                        ? 'var(--vm-accent-warning)'
                                        : 'var(--vm-accent-secondary)',
                                    color: mappingMode && mappingLfoId === selectedLfo.id ? '#000' : '#fff',
                                }}
                            >
                                {mappingMode && mappingLfoId === selectedLfo.id
                                    ? 'SELECT PARAMETER BELOW...'
                                    : 'MAP TO PARAMETER'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Mapping Target Selection */}
                {mappingMode && (
                    <div style={{
                        width: '180px',
                        borderLeft: '1px solid var(--vm-panel-border)',
                        paddingLeft: '8px',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}>
                            <span style={{
                                fontFamily: 'var(--font-label)',
                                fontSize: '9px',
                                color: 'var(--vm-silkscreen)',
                                letterSpacing: '0.1em',
                            }}>
                                SELECT TARGET
                            </span>
                            <button
                                onClick={cancelMapping}
                                className="vm-button"
                                style={{ fontSize: '9px', padding: '2px 6px' }}
                            >
                                X
                            </button>
                        </div>
                        <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                            {effects.map(effect => (
                                <div key={effect.id} style={{ marginBottom: '8px' }}>
                                    <div style={{
                                        fontFamily: 'var(--font-label)',
                                        fontSize: '9px',
                                        color: 'var(--vm-silkscreen)',
                                        letterSpacing: '0.05em',
                                        marginBottom: '4px',
                                    }}>
                                        {effect.name}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                        {effect.parameters.filter(p => p.type === 'float').map(param => {
                                            const isModulated = lfoManager.isParameterModulated(effect.id, param.id);
                                            return (
                                                <button
                                                    key={param.id}
                                                    onClick={() => handleMapParameter(effect.id, param.id, param.min || 0, param.max || 1)}
                                                    className="vm-button"
                                                    style={{
                                                        fontSize: '9px',
                                                        padding: '3px 6px',
                                                        background: isModulated
                                                            ? 'var(--vm-accent-warning)'
                                                            : 'var(--vm-enclosure-mid)',
                                                        color: isModulated ? '#000' : 'var(--vm-text-secondary)',
                                                    }}
                                                >
                                                    {param.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Current Mappings */}
            {lfoManager.mappings.length > 0 && !mappingMode && (
                <div style={{
                    borderTop: '1px solid var(--vm-panel-border)',
                    padding: '8px',
                    maxHeight: '60px',
                    overflowY: 'auto',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: '9px',
                        color: 'var(--vm-silkscreen-dim)',
                        marginBottom: '4px',
                        letterSpacing: '0.1em',
                    }}>
                        ACTIVE MAPPINGS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '3px 8px',
                                        background: 'var(--vm-enclosure-dark)',
                                        borderRadius: '3px',
                                        border: '1px solid var(--vm-panel-border)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '10px',
                                        color: 'var(--vm-text-secondary)',
                                    }}
                                >
                                    <span style={{ color: 'var(--vm-accent-warning)' }}>{lfo.name}</span>
                                    <span style={{ opacity: 0.5 }}>→</span>
                                    <span>{effect.name}.{param.label}</span>
                                    <button
                                        onClick={() => handleUnmapParameter(mapping.effectId, mapping.parameterId)}
                                        style={{
                                            background: 'var(--vm-accent-danger)',
                                            border: 'none',
                                            color: 'white',
                                            padding: '1px 4px',
                                            cursor: 'pointer',
                                            borderRadius: '2px',
                                            fontSize: '9px',
                                            marginLeft: '4px',
                                        }}
                                    >
                                        x
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
