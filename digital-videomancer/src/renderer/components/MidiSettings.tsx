import React, { useEffect, useState } from 'react';
import { MidiManager } from '../services/MidiManager';

interface MidiSettingsProps {
    midiManager: MidiManager;
}

export const MidiSettings: React.FC<MidiSettingsProps> = ({ midiManager }) => {
    const [inputs, setInputs] = useState<{ id: string, name: string }[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [mappings, setMappings] = useState<[string, string][]>([]);

    useEffect(() => {
        const updateInputs = () => {
            const devices = midiManager.getInputs();
            setInputs(devices);

            if (!selectedId && devices.length > 0) {
                const savedId = localStorage.getItem('midi_selected_device');
                if (savedId && devices.find(d => d.id === savedId)) {
                    handleSelect(savedId);
                } else {
                    handleSelect(devices[0].id);
                }
            }
        };

        updateInputs();
        const interval = setInterval(updateInputs, 2000);
        return () => clearInterval(interval);
    }, [midiManager]);

    useEffect(() => {
        const updateMappings = () => {
            const map = midiManager.getParamMap();
            setMappings(Object.entries(map));
        };

        updateMappings();
        const interval = setInterval(updateMappings, 1000);
        return () => clearInterval(interval);
    }, [midiManager]);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        midiManager.selectInput(id);
        localStorage.setItem('midi_selected_device', id);
    };

    const handleClearMapping = (paramId: string) => {
        const map = midiManager.getParamMap();
        delete map[paramId];
        localStorage.setItem('midi_param_map', JSON.stringify(map));
    };

    const handleClearAll = () => {
        if (confirm('Clear all MIDI mappings?')) {
            localStorage.removeItem('midi_param_map');
            localStorage.removeItem('midi_mappings');
            window.location.reload();
        }
    };

    return (
        <div className="console-panel">
            <div className="console-panel-header">
                <span>MIDI</span>
                <div className={`led-indicator ${selectedId ? 'active' : ''}`} />
            </div>

            <div className="console-panel-content">
                {/* Input Device Selector */}
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
                        INPUT DEVICE
                    </label>
                    <select
                        value={selectedId}
                        onChange={(e) => handleSelect(e.target.value)}
                        className="vm-select"
                        style={{ width: '100%' }}
                    >
                        <option value="">SELECT DEVICE...</option>
                        {inputs.map(input => (
                            <option key={input.id} value={input.id}>
                                {input.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mappings List */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                    }}>
                        <label style={{
                            fontFamily: 'var(--font-label)',
                            fontSize: '9px',
                            color: 'var(--vm-silkscreen-dim)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}>
                            MAPPINGS ({mappings.length})
                        </label>
                        <button
                            onClick={handleClearAll}
                            className="vm-button"
                            style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                            }}
                        >
                            CLEAR ALL
                        </button>
                    </div>

                    <div style={{
                        maxHeight: '100px',
                        overflowY: 'auto',
                        background: 'var(--vm-enclosure-dark)',
                        borderRadius: '3px',
                        border: '1px solid var(--vm-panel-border)',
                    }}>
                        {mappings.length === 0 && (
                            <div style={{
                                padding: '8px',
                                color: 'var(--vm-text-dim)',
                                fontSize: '10px',
                                textAlign: 'center',
                                fontFamily: 'var(--font-label)',
                            }}>
                                NO MAPPINGS
                            </div>
                        )}
                        {mappings.map(([paramId, midiId]) => (
                            <div
                                key={paramId}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    borderBottom: '1px solid var(--vm-panel-border)',
                                    fontSize: '10px',
                                }}
                            >
                                <span
                                    title={paramId}
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100px',
                                        color: 'var(--vm-text-secondary)',
                                        fontFamily: 'var(--font-label)',
                                    }}
                                >
                                    {paramId}
                                </span>
                                <span style={{
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--vm-lcd-text)',
                                    textShadow: '0 0 4px var(--vm-lcd-glow)',
                                }}>
                                    {midiId}
                                </span>
                                <button
                                    onClick={() => handleClearMapping(paramId)}
                                    style={{
                                        background: 'var(--vm-accent-danger)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '1px 4px',
                                        cursor: 'pointer',
                                        borderRadius: '2px',
                                        fontSize: '9px',
                                    }}
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
