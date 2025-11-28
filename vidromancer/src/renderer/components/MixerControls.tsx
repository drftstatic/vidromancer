import React, { useState, useCallback, DragEvent } from 'react';
import { Mixer, BlendMode } from '../engine/Mixer';
import { SourceManager } from '../engine/SourceManager';
import { VideoSourceType } from '../engine/VideoSource';

interface MixerControlsProps {
    mixer: Mixer;
    sourceManager: SourceManager;
    onMixChange?: (value: number) => void;
    onSourceChange?: () => void;
}

interface SourceState {
    type: VideoSourceType;
    filename?: string;
}

export const MixerControls: React.FC<MixerControlsProps> = ({ mixer, sourceManager, onMixChange, onSourceChange }) => {
    const [sourceA, setSourceA] = useState<SourceState>({ type: 'none' });
    const [sourceB, setSourceB] = useState<SourceState>({ type: 'none' });
    const [dragOverA, setDragOverA] = useState(false);
    const [dragOverB, setDragOverB] = useState(false);

    const openFilePicker = useCallback((slot: 'A' | 'B') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const url = URL.createObjectURL(file);
                if (slot === 'A') {
                    await sourceManager.setSourceA('file', url);
                    setSourceA({ type: 'file', filename: file.name });
                } else {
                    await sourceManager.setSourceB('file', url);
                    setSourceB({ type: 'file', filename: file.name });
                }
                onSourceChange?.();
            }
        };
        input.click();
    }, [sourceManager, onSourceChange]);

    const handleSourceChange = async (slot: 'A' | 'B', type: VideoSourceType) => {
        if (type === 'file') {
            openFilePicker(slot);
        } else {
            if (slot === 'A') {
                await sourceManager.setSourceA(type);
                setSourceA({ type, filename: undefined });
            } else {
                await sourceManager.setSourceB(type);
                setSourceB({ type, filename: undefined });
            }
            onSourceChange?.();
        }
    };

    const handleFileDrop = useCallback(async (slot: 'A' | 'B', file: File) => {
        if (!file.type.startsWith('video/')) {
            console.warn('Not a video file:', file.type);
            return;
        }
        const url = URL.createObjectURL(file);
        if (slot === 'A') {
            await sourceManager.setSourceA('file', url);
            setSourceA({ type: 'file', filename: file.name });
        } else {
            await sourceManager.setSourceB('file', url);
            setSourceB({ type: 'file', filename: file.name });
        }
        onSourceChange?.();
    }, [sourceManager, onSourceChange]);

    const handleDragOver = (e: DragEvent, slot: 'A' | 'B') => {
        e.preventDefault();
        e.stopPropagation();
        if (slot === 'A') setDragOverA(true);
        else setDragOverB(true);
    };

    const handleDragLeave = (e: DragEvent, slot: 'A' | 'B') => {
        e.preventDefault();
        e.stopPropagation();
        if (slot === 'A') setDragOverA(false);
        else setDragOverB(false);
    };

    const handleDrop = async (e: DragEvent, slot: 'A' | 'B') => {
        e.preventDefault();
        e.stopPropagation();
        if (slot === 'A') setDragOverA(false);
        else setDragOverB(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await handleFileDrop(slot, file);
        }
    };

    const handleMixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        mixer.setMixRatio(value);
        onMixChange?.(value);
    };

    const handleBlendChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        mixer.setBlendMode(e.target.value as BlendMode);
    };

    const truncateFilename = (name: string, maxLength: number = 12) => {
        if (name.length <= maxLength) return name;
        const ext = name.split('.').pop() || '';
        const base = name.slice(0, maxLength - ext.length - 3);
        return `${base}...${ext}`;
    };

    const renderSourceControl = (slot: 'A' | 'B', state: SourceState, isDragOver: boolean) => {
        const hasFile = state.type === 'file' && state.filename;

        return (
            <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                onDragOver={(e) => handleDragOver(e, slot)}
                onDragLeave={(e) => handleDragLeave(e, slot)}
                onDrop={(e) => handleDrop(e, slot)}
            >
                <label style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    color: 'var(--vm-silkscreen)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                }}>
                    Source {slot}
                </label>

                {hasFile ? (
                    // File is loaded - show filename button that opens picker
                    <button
                        onClick={() => openFilePicker(slot)}
                        className="vm-source-button"
                        title={`${state.filename}\nClick to load different file\nOr drag & drop`}
                        style={{
                            minWidth: '120px',
                            padding: '6px 10px',
                            background: isDragOver ? 'var(--vm-led-green)' : 'var(--vm-channel-bg)',
                            border: isDragOver ? '2px dashed var(--vm-led-green)' : '1px solid var(--vm-channel-border)',
                            borderRadius: '4px',
                            color: isDragOver ? 'black' : 'var(--vm-phosphor)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--vm-led-green)',
                            boxShadow: '0 0 6px var(--vm-led-green)',
                            flexShrink: 0,
                        }} />
                        <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                        }}>
                            {truncateFilename(state.filename!)}
                        </span>
                        <span style={{
                            opacity: 0.5,
                            fontSize: '9px',
                            flexShrink: 0,
                        }}>▼</span>
                    </button>
                ) : (
                    // No file - show dropdown
                    <div style={{ position: 'relative' }}>
                        <select
                            value={state.type}
                            onChange={(e) => handleSourceChange(slot, e.target.value as VideoSourceType)}
                            className="vm-select"
                            style={{
                                minWidth: '120px',
                                background: isDragOver ? 'var(--vm-led-green)' : undefined,
                                borderColor: isDragOver ? 'var(--vm-led-green)' : undefined,
                                color: isDragOver ? 'black' : undefined,
                            }}
                        >
                            <option value="none">NONE</option>
                            <option value="webcam">WEBCAM</option>
                            <option value="file">FILE...</option>
                        </select>
                        {isDragOver && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--vm-led-green)',
                                borderRadius: '4px',
                                color: 'black',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                pointerEvents: 'none',
                            }}>
                                DROP
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
        }}>
            {/* Source A */}
            {renderSourceControl('A', sourceA, dragOverA)}

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
            {renderSourceControl('B', sourceB, dragOverB)}

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
