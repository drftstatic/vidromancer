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

const categoryLabels: Record<string, string> = {
    blur: '🔵 Blur',
    distortion: '🌀 Distortion',
    color: '🎨 Color',
    stylize: '✨ Stylize',
    key: '🔑 Key',
    time: '⏱️ Time',
};

export const EffectStack: React.FC<EffectStackProps> = ({ chain, selectedEffectId, onSelectEffect, onUpdate }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

    return (
        <div style={{ width: '250px', background: '#222', color: '#eee', padding: '10px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #444' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1em' }}>Effects</h3>

            {/* Add Effect Button */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        background: '#4a4',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        borderRadius: '4px',
                    }}
                >
                    + Add Effect
                </button>

                {/* Effect Menu */}
                {menuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#333',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        zIndex: 100,
                        maxHeight: '300px',
                        overflowY: 'auto',
                    }}>
                        {categories.map(category => (
                            <div key={category}>
                                <div
                                    onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                                    style={{
                                        padding: '8px',
                                        background: activeCategory === category ? '#444' : 'transparent',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #444',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span>{categoryLabels[category] || category}</span>
                                    <span>{activeCategory === category ? '▼' : '▶'}</span>
                                </div>
                                {activeCategory === category && (
                                    <div style={{ background: '#2a2a2a' }}>
                                        {getEffectsByCategory(category).map(effectName => (
                                            <div
                                                key={effectName}
                                                onClick={() => addEffect(effectName)}
                                                style={{
                                                    padding: '6px 16px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9em',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {effectName}
                                                <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '8px' }}>
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
                    <div style={{ color: '#666', fontSize: '0.9em', textAlign: 'center', padding: '20px' }}>
                        No effects added yet.<br />Click "Add Effect" to start.
                    </div>
                )}
                {chain.getEffects().map((effect, index) => (
                    <div
                        key={effect.id}
                        onClick={() => onSelectEffect(effect)}
                        style={{
                            padding: '8px',
                            marginBottom: '4px',
                            background: effect.id === selectedEffectId ? '#444' : '#333',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '4px',
                            border: effect.id === selectedEffectId ? '1px solid #666' : '1px solid transparent',
                        }}
                    >
                        <span style={{ flex: 1 }}>{index + 1}. {effect.name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); moveEffect(index, 'up'); }}
                                disabled={index === 0}
                                style={{
                                    fontSize: '0.7em',
                                    padding: '2px 5px',
                                    background: index === 0 ? '#2a2a2a' : '#555',
                                    border: 'none',
                                    color: index === 0 ? '#666' : 'white',
                                    cursor: index === 0 ? 'default' : 'pointer',
                                    borderRadius: '2px',
                                }}
                            >
                                ▲
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); moveEffect(index, 'down'); }}
                                disabled={index === chain.getEffects().length - 1}
                                style={{
                                    fontSize: '0.7em',
                                    padding: '2px 5px',
                                    background: index === chain.getEffects().length - 1 ? '#2a2a2a' : '#555',
                                    border: 'none',
                                    color: index === chain.getEffects().length - 1 ? '#666' : 'white',
                                    cursor: index === chain.getEffects().length - 1 ? 'default' : 'pointer',
                                    borderRadius: '2px',
                                }}
                            >
                                ▼
                            </button>
                            <button
                                onClick={(e) => removeEffect(e, effect.id)}
                                style={{
                                    fontSize: '0.7em',
                                    padding: '2px 5px',
                                    background: '#a44',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    borderRadius: '2px',
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Effect Count */}
            {chain.getEffects().length > 0 && (
                <div style={{ fontSize: '0.8em', color: '#666', textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #333' }}>
                    {chain.getEffects().length} effect{chain.getEffects().length !== 1 ? 's' : ''} in chain
                </div>
            )}
        </div>
    );
};
