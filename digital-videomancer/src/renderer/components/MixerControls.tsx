import React from 'react';
import { Mixer, BlendMode } from '../engine/Mixer';
import { SourceManager } from '../engine/SourceManager';
import { VideoSourceType } from '../engine/VideoSource';

interface MixerControlsProps {
    mixer: Mixer;
    sourceManager: SourceManager;
}

export const MixerControls: React.FC<MixerControlsProps> = ({ mixer, sourceManager }) => {
    const handleSourceChange = async (slot: 'A' | 'B', type: VideoSourceType) => {
        if (slot === 'A') {
            if (type === 'file') {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) await sourceManager.setSourceA('file', URL.createObjectURL(file));
                };
                input.click();
            } else {
                await sourceManager.setSourceA(type);
            }
        } else {
            if (type === 'file') {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) await sourceManager.setSourceB('file', URL.createObjectURL(file));
                };
                input.click();
            } else {
                await sourceManager.setSourceB(type);
            }
        }
    };

    const handleMixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        mixer.setMixRatio(parseFloat(e.target.value));
    };

    const handleBlendChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        mixer.setBlendMode(e.target.value as BlendMode);
    };

    return (
        <div className="mixer-controls" style={{ padding: '10px', background: '#222', color: '#eee', borderTop: '1px solid #444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div className="source-a">
                    <label>Source A: </label>
                    <select onChange={(e) => handleSourceChange('A', e.target.value as VideoSourceType)}>
                        <option value="none">None</option>
                        <option value="webcam">Webcam</option>
                        <option value="file">File</option>
                    </select>
                </div>
                <div className="source-b">
                    <label>Source B: </label>
                    <select onChange={(e) => handleSourceChange('B', e.target.value as VideoSourceType)}>
                        <option value="none">None</option>
                        <option value="webcam">Webcam</option>
                        <option value="file">File</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>A</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="0"
                    onChange={handleMixChange}
                    style={{ flex: 1 }}
                />
                <span>B</span>
            </div>

            <div style={{ marginTop: '10px' }}>
                <label>Blend Mode: </label>
                <select onChange={handleBlendChange}>
                    <option value="normal">Normal (Crossfade)</option>
                    <option value="add">Add</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="difference">Difference</option>
                </select>
            </div>
        </div>
    );
};
