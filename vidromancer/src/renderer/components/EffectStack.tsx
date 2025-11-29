import React, { useState } from 'react';
import { EffectChain } from '../engine/EffectChain';
import { Effect } from '../engine/effects/Effect';
import { effectRegistry, getCategories, getEffectsByCategory, createEffect } from '../engine/effects';

interface EffectStackProps {
    chain: EffectChain;
    selectedEffectId: string | null;
    onSelectEffect: (effect: Effect) => void;
    onUpdate: () => void;
}

const categoryIcons: Record<string, string> = {
    blur: '~',
    distortion: '@',
    color: '#',
    stylize: '*',
    key: '%',
    time: '&',
    audio: '♫',
};

// Category tab labels for filtering (short names)
const categoryTabLabels: Record<string, string> = {
    all: 'ALL',
    video: 'VIDEO',
    audio: 'AUDIO',
};

// Categories that fall under 'video' tab
const videoCategories = ['blur', 'distortion', 'color', 'stylize', 'key', 'time'];

export const EffectStack: React.FC<EffectStackProps> = ({ chain, selectedEffectId, onSelectEffect, onUpdate }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio'>('all');

    const addEffect = (name: string) => {
        const effect = createEffect(name);
        if (effect) {
            chain.add(effect);
            onSelectEffect(effect);
            onUpdate();
        }
        setMenuOpen(false);
        setActiveCategory(null);
    };

    const removeEffect = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        chain.remove(id);
        onUpdate();
    };

    const moveEffect = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < chain.getEffects().length) {
            chain.move(index, newIndex);
            onUpdate();
        }
    };

    const categories = getCategories();

    // Filter categories based on active tab
    const getFilteredCategories = () => {
        if (activeTab === 'video') {
            return categories.filter(c => videoCategories.includes(c));
        } else if (activeTab === 'audio') {
            return categories.filter(c => c === 'audio');
        }
        return categories;
    };

    return (
        <div className="console-panel" style={{ flex: 1 }}>
            <div className="console-panel-header">
                <span>Effects</span>
                <div className={`led-indicator ${chain.getEffects().length > 0 ? 'active' : ''}`} />
            </div>

            <div className="console-panel-content">
                {/* Category Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '2px',
                    marginBottom: '8px',
                    background: 'var(--vm-enclosure-dark)',
                    borderRadius: '3px',
                    padding: '2px',
                }}>
                    {(['all', 'video', 'audio'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '5px 8px',
                                border: 'none',
                                borderRadius: '2px',
                                background: activeTab === tab
                                    ? 'linear-gradient(180deg, var(--vm-enclosure-light) 0%, var(--vm-enclosure-mid) 100%)'
                                    : 'transparent',
                                color: activeTab === tab
                                    ? 'var(--vm-text-primary)'
                                    : 'var(--vm-text-dim)',
                                fontSize: '9px',
                                fontFamily: 'var(--font-label)',
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                                transition: 'all var(--vm-transition-fast)',
                                boxShadow: activeTab === tab
                                    ? 'var(--vm-shadow-sm)'
                                    : 'none',
                            }}
                        >
                            {categoryTabLabels[tab]}
                        </button>
                    ))}
                </div>

                {/* Add Effect Button */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="vm-button vm-button-primary"
                        style={{ width: '100%' }}
                    >
                        + Add {activeTab === 'audio' ? 'Audio' : activeTab === 'video' ? 'Video' : ''} Effect
                    </button>

                    {/* Effect Menu */}
                    {menuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--vm-enclosure-base)',
                            border: '1px solid var(--vm-enclosure-light)',
                            borderRadius: '4px',
                            zIndex: 100,
                            maxHeight: '280px',
                            overflowY: 'auto',
                            boxShadow: 'var(--vm-shadow-lg)',
                            marginTop: '4px',
                        }}>
                            {getFilteredCategories().map(category => (
                                <div key={category}>
                                    <div
                                        onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                                        style={{
                                            padding: '8px 12px',
                                            background: activeCategory === category ? 'var(--vm-enclosure-mid)' : 'transparent',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--vm-panel-border)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontFamily: 'var(--font-label)',
                                            fontSize: '11px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            color: 'var(--vm-silkscreen)',
                                            transition: 'background var(--vm-transition-fast)',
                                        }}
                                    >
                                        <span>
                                            <span style={{ marginRight: '8px', opacity: 0.6 }}>{categoryIcons[category]}</span>
                                            {category}
                                        </span>
                                        <span style={{
                                            transform: activeCategory === category ? 'rotate(90deg)' : 'none',
                                            transition: 'transform var(--vm-transition-fast)',
                                            opacity: 0.5,
                                        }}>▶</span>
                                    </div>
                                    {activeCategory === category && (
                                        <div style={{ background: 'var(--vm-enclosure-dark)' }}>
                                            {getEffectsByCategory(category).map(effectName => (
                                                <div
                                                    key={effectName}
                                                    onClick={() => addEffect(effectName)}
                                                    style={{
                                                        padding: '6px 16px 6px 28px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontFamily: 'var(--font-label)',
                                                        color: 'var(--vm-text-secondary)',
                                                        borderBottom: '1px solid var(--vm-panel-border)',
                                                        transition: 'all var(--vm-transition-fast)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'var(--vm-enclosure-mid)';
                                                        e.currentTarget.style.color = 'var(--vm-text-primary)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = 'var(--vm-text-secondary)';
                                                    }}
                                                >
                                                    {effectName}
                                                    <span style={{
                                                        fontSize: '10px',
                                                        color: 'var(--vm-text-dim)',
                                                        marginLeft: '8px',
                                                        fontFamily: 'var(--font-mono)',
                                                    }}>
                                                        {effectRegistry[effectName]?.description}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Effect List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {chain.getEffects().length === 0 && (
                        <div style={{
                            color: 'var(--vm-text-dim)',
                            fontSize: '11px',
                            textAlign: 'center',
                            padding: '24px 12px',
                            fontFamily: 'var(--font-label)',
                            letterSpacing: '0.05em',
                        }}>
                            NO EFFECTS LOADED
                            <br />
                            <span style={{ fontSize: '10px', opacity: 0.6 }}>Click "+ Add Effect" to start</span>
                        </div>
                    )}
                    {chain.getEffects().map((effect, index) => (
                        <div
                            key={effect.id}
                            onClick={() => onSelectEffect(effect)}
                            style={{
                                padding: '8px 10px',
                                marginBottom: '4px',
                                background: effect.id === selectedEffectId
                                    ? 'linear-gradient(180deg, var(--vm-enclosure-mid) 0%, var(--vm-enclosure-base) 100%)'
                                    : 'var(--vm-enclosure-dark)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderRadius: '3px',
                                border: effect.id === selectedEffectId
                                    ? '1px solid var(--vm-enclosure-light)'
                                    : '1px solid transparent',
                                boxShadow: effect.id === selectedEffectId
                                    ? 'var(--vm-shadow-sm)'
                                    : 'none',
                                transition: 'all var(--vm-transition-fast)',
                            }}
                        >
                            <span style={{
                                flex: 1,
                                fontFamily: 'var(--font-label)',
                                fontSize: '11px',
                                letterSpacing: '0.05em',
                                color: effect.id === selectedEffectId
                                    ? 'var(--vm-text-accent)'
                                    : 'var(--vm-text-secondary)',
                            }}>
                                <span style={{
                                    opacity: 0.5,
                                    marginRight: '8px',
                                    fontFamily: 'var(--font-mono)',
                                }}>{String(index + 1).padStart(2, '0')}</span>
                                {effect.name}
                            </span>
                            <div style={{ display: 'flex', gap: '3px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); moveEffect(index, 'up'); }}
                                    disabled={index === 0}
                                    className="vm-button vm-button-square"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        fontSize: '10px',
                                        opacity: index === 0 ? 0.3 : 1,
                                        padding: 0,
                                    }}
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); moveEffect(index, 'down'); }}
                                    disabled={index === chain.getEffects().length - 1}
                                    className="vm-button vm-button-square"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        fontSize: '10px',
                                        opacity: index === chain.getEffects().length - 1 ? 0.3 : 1,
                                        padding: 0,
                                    }}
                                >
                                    ▼
                                </button>
                                <button
                                    onClick={(e) => removeEffect(e, effect.id)}
                                    className="vm-button vm-button-danger vm-button-square"
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        fontSize: '10px',
                                        padding: 0,
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Effect Count */}
                {chain.getEffects().length > 0 && (
                    <div style={{
                        fontSize: '10px',
                        color: 'var(--vm-text-dim)',
                        textAlign: 'center',
                        paddingTop: '8px',
                        marginTop: '8px',
                        borderTop: '1px solid var(--vm-panel-border)',
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {chain.getEffects().length} EFFECT{chain.getEffects().length !== 1 ? 'S' : ''} IN CHAIN
                    </div>
                )}
            </div>
        </div>
    );
};
