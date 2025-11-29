// Effect Registry - Central registration for all effects
import { Effect } from './Effect';
import { BlurEffect } from './BlurEffect';
import { GlitchEffect } from './GlitchEffect';
import { ColoramaEffect } from './ColoramaEffect';
import { FeedbackEffect } from './FeedbackEffect';
import { MirrorEffect } from './MirrorEffect';
import { KaleidoscopeEffect } from './KaleidoscopeEffect';
import { EdgeDetectEffect } from './EdgeDetectEffect';
import { PixelateEffect } from './PixelateEffect';
import { PosterizeEffect } from './PosterizeEffect';
import { InvertEffect } from './InvertEffect';
import { ScanlinesEffect } from './ScanlinesEffect';
import { VHSEffect } from './VHSEffect';
import { DisplacementEffect } from './DisplacementEffect';
import { LumaKeyEffect } from './LumaKeyEffect';
import { AudioSpectrumEffect } from './AudioSpectrumEffect';
import { AudioWaveformEffect } from './AudioWaveformEffect';
import { AudioGlowEffect } from './AudioGlowEffect';

// Type for effect constructor
type EffectConstructor = new () => Effect;

// Effect registry with metadata
export interface EffectRegistryEntry {
    constructor: EffectConstructor;
    category: 'distortion' | 'color' | 'stylize' | 'key' | 'blur' | 'time' | 'audio';
    description: string;
}

export const effectRegistry: Record<string, EffectRegistryEntry> = {
    // Blur/Smoothing
    Blur: {
        constructor: BlurEffect,
        category: 'blur',
        description: 'Gaussian-like blur effect'
    },

    // Distortion Effects
    Glitch: {
        constructor: GlitchEffect,
        category: 'distortion',
        description: 'RGB channel separation glitch'
    },
    Mirror: {
        constructor: MirrorEffect,
        category: 'distortion',
        description: 'Mirror/flip portions of the frame'
    },
    Kaleidoscope: {
        constructor: KaleidoscopeEffect,
        category: 'distortion',
        description: 'Radial kaleidoscope segments'
    },
    Displacement: {
        constructor: DisplacementEffect,
        category: 'distortion',
        description: 'Displace pixels by luminance'
    },

    // Color Effects
    Colorama: {
        constructor: ColoramaEffect,
        category: 'color',
        description: 'Map luminance to color cycle'
    },
    Invert: {
        constructor: InvertEffect,
        category: 'color',
        description: 'Invert colors'
    },
    Posterize: {
        constructor: PosterizeEffect,
        category: 'color',
        description: 'Reduce color levels'
    },

    // Stylize Effects
    EdgeDetect: {
        constructor: EdgeDetectEffect,
        category: 'stylize',
        description: 'Sobel edge detection'
    },
    Pixelate: {
        constructor: PixelateEffect,
        category: 'stylize',
        description: 'Retro pixel art effect'
    },
    Scanlines: {
        constructor: ScanlinesEffect,
        category: 'stylize',
        description: 'CRT-style scanlines'
    },
    VHS: {
        constructor: VHSEffect,
        category: 'stylize',
        description: 'VHS tape distortion'
    },

    // Keying Effects
    LumaKey: {
        constructor: LumaKeyEffect,
        category: 'key',
        description: 'Key out by luminance'
    },

    // Time-based Effects
    Feedback: {
        constructor: FeedbackEffect,
        category: 'time',
        description: 'Video feedback with decay'
    },

    // Audio-reactive Effects
    AudioSpectrum: {
        constructor: AudioSpectrumEffect,
        category: 'audio',
        description: 'Frequency spectrum visualization'
    },
    AudioWaveform: {
        constructor: AudioWaveformEffect,
        category: 'audio',
        description: 'Oscilloscope waveform display'
    },
    AudioGlow: {
        constructor: AudioGlowEffect,
        category: 'audio',
        description: 'Audio-reactive edge glow'
    },
};

// Helper to create effect by name
export function createEffect(name: string): Effect | null {
    const entry = effectRegistry[name];
    if (entry) {
        return new entry.constructor();
    }
    return null;
}

// Get effects by category
export function getEffectsByCategory(category: EffectRegistryEntry['category']): string[] {
    return Object.entries(effectRegistry)
        .filter(([, entry]) => entry.category === category)
        .map(([name]) => name);
}

// Get all effect names
export function getAllEffectNames(): string[] {
    return Object.keys(effectRegistry);
}

// Get all categories
export function getCategories(): EffectRegistryEntry['category'][] {
    return ['blur', 'distortion', 'color', 'stylize', 'key', 'time', 'audio'];
}
