import React, { useState, useEffect } from 'react';
import { AudioManager, AudioDevice } from '../services/AudioManager';

interface AudioSettingsProps {
    audioManager: AudioManager;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ audioManager }) => {
    const [devices, setDevices] = useState<AudioDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    const [levels, setLevels] = useState({ bass: 0, mid: 0, treble: 0, vol: 0 });

    useEffect(() => {
        audioManager.getDevices().then(devs => {
            setDevices(devs);
            if (devs.length > 0) {
                // Don't auto-select to avoid permission prompt immediately on load
                // But if we want to be helpful... let's wait for user action
            }
        });

        const interval = setInterval(() => {
            setLevels({
                bass: audioManager.bass,
                mid: audioManager.mid,
                treble: audioManager.treble,
                vol: audioManager.volume
            });
        }, 50);

        return () => clearInterval(interval);
    }, [audioManager]);

    const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedDevice(deviceId);
        if (deviceId) {
            audioManager.setInputDevice(deviceId);
        }
    };

    return (
        <div className="console-panel" style={{ marginTop: '10px' }}>
            <div className="console-panel-header">
                <span>Audio Input</span>
                <div className={`led-indicator ${selectedDevice ? 'active' : ''}`} />
            </div>
            <div className="console-panel-content">
                <div style={{ marginBottom: '10px' }}>
                    <select
                        className="vm-select"
                        value={selectedDevice}
                        onChange={handleDeviceChange}
                        style={{ width: '100%' }}
                    >
                        <option value="">Select Input...</option>
                        {devices.map(d => (
                            <option key={d.deviceId} value={d.deviceId}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Visualizer */}
                <div style={{ display: 'flex', gap: '4px', height: '60px', alignItems: 'flex-end' }}>
                    <LevelBar label="BASS" value={levels.bass} color="var(--vm-accent-primary)" />
                    <LevelBar label="MID" value={levels.mid} color="var(--vm-accent-secondary)" />
                    <LevelBar label="HIGH" value={levels.treble} color="var(--vm-accent-tertiary)" />
                    <LevelBar label="VOL" value={levels.vol} color="#fff" />
                </div>
            </div>
        </div>
    );
};

const LevelBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={{
            width: '100%',
            height: '100%',
            background: 'var(--vm-enclosure-dark)',
            position: 'relative',
            borderRadius: '2px',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${Math.min(100, value * 100)}%`,
                background: color,
                transition: 'height 0.05s linear'
            }} />
        </div>
        <span style={{
            fontSize: '8px',
            fontFamily: 'var(--font-label)',
            color: 'var(--vm-text-dim)'
        }}>
            {label}
        </span>
    </div>
);
