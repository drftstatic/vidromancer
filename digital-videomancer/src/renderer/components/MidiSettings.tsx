import React, { useEffect, useState } from 'react';
import { MidiManager } from '../services/MidiManager';

interface MidiSettingsProps {
    midiManager: MidiManager;
}

export const MidiSettings: React.FC<MidiSettingsProps> = ({ midiManager }) => {
    const [inputs, setInputs] = useState<{ id: string, name: string }[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [mappings, setMappings] = useState<[string, string][]>([]); // [ParamID, MidiID]

    useEffect(() => {
        const updateInputs = () => {
            const devices = midiManager.getInputs();
            setInputs(devices);

            // Auto-select first if none selected
            if (!selectedId && devices.length > 0) {
                // Check if we have a saved preference
                const savedId = localStorage.getItem('midi_selected_device');
                if (savedId && devices.find(d => d.id === savedId)) {
                    handleSelect(savedId);
                } else {
                    handleSelect(devices[0].id);
                }
            }
        };

        // Initial load
        updateInputs();

        // Poll for connection changes (since we don't have a direct event exposed from manager yet for UI updates)
        // In a real app, we'd use an event emitter or context. For now, polling is simple and effective.
        const interval = setInterval(updateInputs, 2000);
        return () => clearInterval(interval);
    }, [midiManager]);

    useEffect(() => {
        // Load mappings for display
        const updateMappings = () => {
            const map = midiManager.getParamMap();
            setMappings(Object.entries(map));
        };

        updateMappings();
        const interval = setInterval(updateMappings, 1000); // Poll for mapping changes
        return () => clearInterval(interval);
    }, [midiManager]);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        midiManager.selectInput(id);
        localStorage.setItem('midi_selected_device', id);
    };

    const handleClearMapping = (paramId: string) => {
        // This is a bit tricky since we need to unmap from the manager
        // We'll need to extend the manager to support unmapping by ParamID or just clear the storage
        // For now, let's just clear the storage and reload
        const map = midiManager.getParamMap();
        delete map[paramId];
        localStorage.setItem('midi_param_map', JSON.stringify(map));
        // Force reload of page to clear actual bindings? Or just let the user re-map.
        // Ideally we'd call midiManager.unmapParameter(paramId)
    };

    const handleClearAll = () => {
        if (confirm('Clear all MIDI mappings?')) {
            localStorage.removeItem('midi_param_map');
            localStorage.removeItem('midi_mappings');
            window.location.reload(); // Simple way to reset state
        }
    };

    return (
        <div className="midi-settings" style={{ padding: '10px', background: '#222', color: '#eee', fontSize: '12px' }}>
            <h3>MIDI Settings</h3>

            <div style={{ marginBottom: '10px' }}>
                <label>Input Device: </label>
                <select
                    value={selectedId}
                    onChange={(e) => handleSelect(e.target.value)}
                    style={{ width: '100%', marginTop: '5px', padding: '5px' }}
                >
                    <option value="">Select Device...</option>
                    {inputs.map(input => (
                        <option key={input.id} value={input.id}>
                            {input.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mappings-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Mappings ({mappings.length})</h4>
                    <button onClick={handleClearAll} style={{ fontSize: '10px', padding: '2px 5px' }}>Clear All</button>
                </div>

                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #444', marginTop: '5px' }}>
                    {mappings.length === 0 && <div style={{ padding: '5px', color: '#888' }}>No mappings</div>}
                    {mappings.map(([paramId, midiId]) => (
                        <div key={paramId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', borderBottom: '1px solid #333' }}>
                            <span title={paramId} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                                {paramId}
                            </span>
                            <span style={{ fontFamily: 'monospace', color: '#aaa' }}>{midiId}</span>
                            <button onClick={() => handleClearMapping(paramId)} style={{ marginLeft: '5px', color: 'red' }}>×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
