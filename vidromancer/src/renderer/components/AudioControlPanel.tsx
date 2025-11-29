import React, { useState, useEffect, useCallback } from 'react';
import { AudioManager, AudioDevice, AudioSourceType } from '../services/AudioManager';
import { SourceManager } from '../engine/SourceManager';
import { AudioLayer, AudioVisualizerType } from '../engine/AudioLayer';
import { BlendMode } from '../engine/Mixer';
import { VUMeter, CompactVU } from './VUMeter';
import './AudioControlPanel.css';

interface AudioControlPanelProps {
    audioManager: AudioManager;
    sourceManager?: SourceManager;
    audioLayer?: AudioLayer;
    compact?: boolean;
}

export const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
    audioManager,
    sourceManager,
    audioLayer,
    compact = false
}) => {
    const [devices, setDevices] = useState<AudioDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    const [sourceType, setSourceType] = useState<AudioSourceType>('none');
    const [inputGain, setInputGain] = useState(1.0);
    const [monitorEnabled, setMonitorEnabled] = useState(false);
    const [monitorVolume, setMonitorVolume] = useState(0.5);
    const [vuLevels, setVuLevels] = useState({ left: 0, right: 0, peak: 0 });
    const [levels, setLevels] = useState({ bass: 0, mid: 0, treble: 0, vol: 0 });

    // Audio visualizer layer state
    const [visualizerType, setVisualizerType] = useState<AudioVisualizerType>('none');
    const [visualizerEnabled, setVisualizerEnabled] = useState(false);
    const [visualizerOpacity, setVisualizerOpacity] = useState(0.7);
    const [visualizerBlendMode, setVisualizerBlendMode] = useState<BlendMode>('add');
    const [visualizerIntensity, setVisualizerIntensity] = useState(1.0);

    // Load devices on mount
    useEffect(() => {
        audioManager.getDevices().then(devs => {
            setDevices(devs);
        });
    }, [audioManager]);

    // Update levels at 60fps
    useEffect(() => {
        let animationId: number;

        const updateLevels = () => {
            setVuLevels(audioManager.getVULevels());
            setLevels({
                bass: audioManager.bass,
                mid: audioManager.mid,
                treble: audioManager.treble,
                vol: audioManager.volume
            });
            animationId = requestAnimationFrame(updateLevels);
        };

        updateLevels();
        return () => cancelAnimationFrame(animationId);
    }, [audioManager]);

    // Handle device change
    const handleDeviceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedDevice(deviceId);
        if (deviceId) {
            audioManager.setInputDevice(deviceId);
            setSourceType('mic');
        }
    }, [audioManager]);

    // Handle source type change
    const handleSourceTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as AudioSourceType | 'clipA' | 'clipB';

        if (type === 'mic') {
            // Re-select mic if we have a device
            if (selectedDevice) {
                audioManager.setInputDevice(selectedDevice);
            }
            setSourceType('mic');
        } else if (type === 'clipA' && sourceManager?.sourceA) {
            const videoElement = sourceManager.sourceA.getVideoElement();
            if (videoElement) {
                audioManager.connectClipAudio(videoElement);
                setSourceType('clip');
            }
        } else if (type === 'clipB' && sourceManager?.sourceB) {
            const videoElement = sourceManager.sourceB.getVideoElement();
            if (videoElement) {
                audioManager.connectClipAudio(videoElement);
                setSourceType('clip');
            }
        }
    }, [audioManager, sourceManager, selectedDevice]);

    // Handle gain change
    const handleGainChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setInputGain(value);
        audioManager.setInputGain(value);
    }, [audioManager]);

    // Handle monitor toggle
    const handleMonitorToggle = useCallback(() => {
        const newEnabled = !monitorEnabled;
        setMonitorEnabled(newEnabled);
        audioManager.setMonitoring(newEnabled, monitorVolume);
    }, [audioManager, monitorEnabled, monitorVolume]);

    // Handle monitor volume change
    const handleMonitorVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setMonitorVolume(value);
        audioManager.setMonitorVolume(value);
    }, [audioManager]);

    // Handle visualizer type change
    const handleVisualizerTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as AudioVisualizerType;
        setVisualizerType(type);
        if (audioLayer) {
            audioLayer.setVisualizerType(type);
            if (type !== 'none' && !visualizerEnabled) {
                setVisualizerEnabled(true);
                audioLayer.setEnabled(true);
            }
        }
    }, [audioLayer, visualizerEnabled]);

    // Handle visualizer enable toggle
    const handleVisualizerToggle = useCallback(() => {
        const newEnabled = !visualizerEnabled;
        setVisualizerEnabled(newEnabled);
        if (audioLayer) {
            audioLayer.setEnabled(newEnabled);
        }
    }, [audioLayer, visualizerEnabled]);

    // Handle visualizer opacity change
    const handleVisualizerOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setVisualizerOpacity(value);
        if (audioLayer) {
            audioLayer.setOpacity(value);
        }
    }, [audioLayer]);

    // Handle visualizer blend mode change
    const handleVisualizerBlendModeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = e.target.value as BlendMode;
        setVisualizerBlendMode(mode);
        if (audioLayer) {
            audioLayer.setBlendMode(mode);
        }
    }, [audioLayer]);

    // Handle visualizer intensity change
    const handleVisualizerIntensityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setVisualizerIntensity(value);
        if (audioLayer) {
            audioLayer.setIntensity(value);
        }
    }, [audioLayer]);

    if (compact) {
        return (
            <div className="audio-control-compact">
                <select
                    className="vm-select vm-select-sm"
                    value={selectedDevice}
                    onChange={handleDeviceChange}
                >
                    <option value="">No Input</option>
                    {devices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>
                            {d.label}
                        </option>
                    ))}
                </select>
                <CompactVU level={vuLevels.left} width={40} />
            </div>
        );
    }

    return (
        <div className="console-panel audio-control-panel">
            <div className="console-panel-header">
                <span>Audio</span>
                <div className={`led-indicator ${sourceType !== 'none' ? 'active' : ''}`} />
            </div>
            <div className="console-panel-content audio-control-content">
                {/* Source Selection */}
                <div className="audio-control-section">
                    <label className="audio-control-label">Source</label>
                    <select
                        className="vm-select"
                        value={sourceType === 'mic' ? 'mic' : sourceType === 'clip' ? 'clipA' : 'none'}
                        onChange={handleSourceTypeChange}
                    >
                        <option value="none">None</option>
                        <option value="mic">Mic Input</option>
                        {sourceManager?.sourceA && <option value="clipA">Clip A Audio</option>}
                        {sourceManager?.sourceB && <option value="clipB">Clip B Audio</option>}
                    </select>
                </div>

                {/* Device Selection (when mic selected) */}
                {(sourceType === 'mic' || sourceType === 'none') && (
                    <div className="audio-control-section">
                        <label className="audio-control-label">Input Device</label>
                        <select
                            className="vm-select"
                            value={selectedDevice}
                            onChange={handleDeviceChange}
                        >
                            <option value="">Select Device...</option>
                            {devices.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Gain Control */}
                <div className="audio-control-section audio-gain-section">
                    <label className="audio-control-label">Input Gain</label>
                    <div className="audio-gain-control">
                        <input
                            type="range"
                            className="vm-fader audio-gain-fader"
                            min="0"
                            max="2"
                            step="0.01"
                            value={inputGain}
                            onChange={handleGainChange}
                        />
                        <span className="audio-gain-value">{(inputGain * 100).toFixed(0)}%</span>
                    </div>
                </div>

                {/* Monitor Control */}
                <div className="audio-control-section audio-monitor-section">
                    <div className="audio-monitor-toggle">
                        <button
                            className={`vm-button vm-button-sm ${monitorEnabled ? 'active' : ''}`}
                            onClick={handleMonitorToggle}
                            title="Enable audio monitoring (playthrough)"
                        >
                            <span className="monitor-icon">🎧</span>
                            MON
                        </button>
                    </div>
                    {monitorEnabled && (
                        <div className="audio-monitor-volume">
                            <input
                                type="range"
                                className="vm-fader vm-fader-sm"
                                min="0"
                                max="1"
                                step="0.01"
                                value={monitorVolume}
                                onChange={handleMonitorVolumeChange}
                            />
                        </div>
                    )}
                </div>

                {/* Level Meters */}
                <div className="audio-control-section audio-levels-section">
                    <div className="audio-level-bars">
                        <LevelBar label="BASS" value={levels.bass} color="var(--vm-accent-primary)" />
                        <LevelBar label="MID" value={levels.mid} color="var(--vm-accent-secondary)" />
                        <LevelBar label="HIGH" value={levels.treble} color="var(--vm-accent-tertiary, #aa66ff)" />
                        <LevelBar label="VOL" value={levels.vol} color="#fff" />
                    </div>
                </div>

                {/* Audio Visualizer Layer Controls */}
                {audioLayer && (
                    <div className="audio-visualizer-section">
                        <div className="audio-section-divider" />
                        <label className="audio-section-title">Visualizer Layer</label>

                        {/* Visualizer Type & Enable */}
                        <div className="audio-control-section audio-viz-header">
                            <select
                                className="vm-select"
                                value={visualizerType}
                                onChange={handleVisualizerTypeChange}
                            >
                                <option value="none">Off</option>
                                <option value="spectrum">Spectrum</option>
                                <option value="waveform">Waveform</option>
                                <option value="circular">Circular</option>
                            </select>
                            <button
                                className={`vm-button vm-button-sm ${visualizerEnabled ? 'active' : ''}`}
                                onClick={handleVisualizerToggle}
                                disabled={visualizerType === 'none'}
                                title="Enable/Disable visualizer layer"
                            >
                                {visualizerEnabled ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        {/* Visualizer Settings (when enabled) */}
                        {visualizerType !== 'none' && (
                            <>
                                {/* Blend Mode */}
                                <div className="audio-control-section">
                                    <label className="audio-control-label">Blend</label>
                                    <select
                                        className="vm-select vm-select-sm"
                                        value={visualizerBlendMode}
                                        onChange={handleVisualizerBlendModeChange}
                                    >
                                        <option value="add">Add</option>
                                        <option value="screen">Screen</option>
                                        <option value="normal">Normal</option>
                                        <option value="multiply">Multiply</option>
                                        <option value="overlay">Overlay</option>
                                        <option value="difference">Difference</option>
                                    </select>
                                </div>

                                {/* Opacity */}
                                <div className="audio-control-section">
                                    <label className="audio-control-label">Opacity</label>
                                    <div className="audio-viz-slider">
                                        <input
                                            type="range"
                                            className="vm-fader vm-fader-sm"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={visualizerOpacity}
                                            onChange={handleVisualizerOpacityChange}
                                        />
                                        <span className="audio-viz-value">{(visualizerOpacity * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {/* Intensity */}
                                <div className="audio-control-section">
                                    <label className="audio-control-label">Intensity</label>
                                    <div className="audio-viz-slider">
                                        <input
                                            type="range"
                                            className="vm-fader vm-fader-sm"
                                            min="0"
                                            max="2"
                                            step="0.01"
                                            value={visualizerIntensity}
                                            onChange={handleVisualizerIntensityChange}
                                        />
                                        <span className="audio-viz-value">{(visualizerIntensity * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Level bar component (frequency bands)
const LevelBar: React.FC<{ label: string; value: number; color: string }> = ({
    label,
    value,
    color
}) => (
    <div className="audio-level-bar">
        <div className="audio-level-bar-track">
            <div
                className="audio-level-bar-fill"
                style={{
                    height: `${Math.min(100, value * 100)}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}40`
                }}
            />
        </div>
        <span className="audio-level-bar-label">{label}</span>
    </div>
);

// Standalone VU Meter Panel for right panel
interface VUMeterPanelProps {
    audioManager: AudioManager;
}

export const VUMeterPanel: React.FC<VUMeterPanelProps> = ({ audioManager }) => {
    const [vuLevels, setVuLevels] = useState({ left: 0, right: 0, peak: 0 });

    useEffect(() => {
        let animationId: number;

        const updateLevels = () => {
            setVuLevels(audioManager.getVULevels());
            animationId = requestAnimationFrame(updateLevels);
        };

        updateLevels();
        return () => cancelAnimationFrame(animationId);
    }, [audioManager]);

    return (
        <VUMeter
            leftLevel={vuLevels.left}
            rightLevel={vuLevels.right}
            peakLevel={vuLevels.peak}
            stereo={true}
        />
    );
};
