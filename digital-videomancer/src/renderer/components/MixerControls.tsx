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
        <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
        }}>
            {/* Source A */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    color: 'var(--vm-silkscreen)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                }}>
                    Source A
                </label>
                <select
                    onChange={(e) => handleSourceChange('A', e.target.value as VideoSourceType)}
                    className="vm-select"
                    style={{ minWidth: '120px' }}
                >
                    <option value="none">NONE</option>
                    <option value="webcam">WEBCAM</option>
                    <option value="file">FILE...</option>
                </select>
            </div>

            {/* Mix Fader */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxWidth: '400px',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-label)',
                    fontSize: '11px',
                    color: 'var(--vm-silkscreen-dim)',
                    letterSpacing: '0.1em',
                }}>
                    <span>A</span>
                    <span style={{ color: 'var(--vm-silkscreen)' }}>CROSSFADE</span>
                    <span>B</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        defaultValue="0"
                        onChange={handleMixChange}
                        className="vm-fader"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Source B */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    color: 'var(--vm-silkscreen)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                }}>
                    Source B
                </label>
                <select
                    onChange={(e) => handleSourceChange('B', e.target.value as VideoSourceType)}
                    className="vm-select"
                    style={{ minWidth: '120px' }}
                >
                    <option value="none">NONE</option>
                    <option value="webcam">WEBCAM</option>
                    <option value="file">FILE...</option>
                </select>
            </div>

            {/* Blend Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    color: 'var(--vm-silkscreen)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                }}>
                    Blend
                </label>
                <select onChange={handleBlendChange} className="vm-select">
                    <option value="normal">NORMAL</option>
                    <option value="add">ADD</option>
                    <option value="multiply">MULTIPLY</option>
                    <option value="screen">SCREEN</option>
                    <option value="overlay">OVERLAY</option>
                    <option value="difference">DIFFERENCE</option>
                </select>
            </div>
        </div>
    );
};
