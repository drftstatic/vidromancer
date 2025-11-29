import { Effect } from '../effects/Effect';
import { AudioManager } from '../../services/AudioManager';
import { AudioSpectrumEffect } from '../effects/AudioSpectrumEffect';
import { AudioWaveformEffect } from '../effects/AudioWaveformEffect';
import { AudioGlowEffect } from '../effects/AudioGlowEffect';

export type AudioFeature = 'bass' | 'mid' | 'treble' | 'vol';

export interface AudioMapping {
    feature: AudioFeature;
    effectId: string;
    parameterId: string;
    min: number;
    max: number;
    amount: number; // 0-1 influence
}

export class AudioReactiveManager {
    public mappings: AudioMapping[] = [];
    private listeners: Set<() => void> = new Set();
    private audioManager: AudioManager;

    constructor(audioManager: AudioManager) {
        this.audioManager = audioManager;
    }

    mapParameter(
        feature: AudioFeature,
        effectId: string,
        parameterId: string,
        min: number,
        max: number,
        amount: number = 1.0
    ) {
        // Remove existing mapping for this parameter if any
        this.unmapParameter(effectId, parameterId);

        this.mappings.push({
            feature,
            effectId,
            parameterId,
            min,
            max,
            amount
        });
        this.notifyListeners();
    }

    unmapParameter(effectId: string, parameterId: string) {
        this.mappings = this.mappings.filter(
            m => !(m.effectId === effectId && m.parameterId === parameterId)
        );
        this.notifyListeners();
    }

    getMappingForParameter(effectId: string, parameterId: string): AudioMapping | undefined {
        return this.mappings.find(
            m => m.effectId === effectId && m.parameterId === parameterId
        );
    }

    update(effects: Effect[]) {
        // First update the audio analysis
        this.audioManager.update();

        // Update audio-specific effects with textures and levels
        for (const effect of effects) {
            // Pass spectrum texture to AudioSpectrumEffect
            if (effect instanceof AudioSpectrumEffect) {
                const spectrumTexture = this.audioManager.getSpectrumTexture();
                if (spectrumTexture) {
                    effect.setSpectrumTexture(spectrumTexture);
                }
            }

            // Pass waveform texture to AudioWaveformEffect
            if (effect instanceof AudioWaveformEffect) {
                const waveformTexture = this.audioManager.getWaveformTexture();
                if (waveformTexture) {
                    effect.setWaveformTexture(waveformTexture);
                }
            }

            // Pass audio levels to AudioGlowEffect
            if (effect instanceof AudioGlowEffect) {
                effect.setAudioLevels(
                    this.audioManager.bass,
                    this.audioManager.mid,
                    this.audioManager.treble,
                    this.audioManager.volume
                );
            }
        }

        // Apply user-configured audio mappings
        for (const mapping of this.mappings) {
            const effect = effects.find(e => e.id === mapping.effectId);
            if (!effect) continue;

            const param = effect.parameters.find(p => p.id === mapping.parameterId);
            if (!param) continue;

            let audioValue = 0;
            switch (mapping.feature) {
                case 'bass': audioValue = this.audioManager.bass; break;
                case 'mid': audioValue = this.audioManager.mid; break;
                case 'treble': audioValue = this.audioManager.treble; break;
                case 'vol': audioValue = this.audioManager.volume; break;
            }

            // Apply amount
            audioValue *= mapping.amount;

            // Map 0-1 to min-max
            const newValue = mapping.min + (mapping.max - mapping.min) * audioValue;

            // Clamp
            let clamped = newValue;
            if (param.min !== undefined) clamped = Math.max(param.min, clamped);
            if (param.max !== undefined) clamped = Math.min(param.max, clamped);

            effect.uniforms[mapping.parameterId].value = clamped;
        }
    }

    onChange(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb());
    }
}
