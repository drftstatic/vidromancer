import { LFO, LFOWaveform } from './LFO';
import { Effect } from '../effects/Effect';

export type ModulationMode = 'replace' | 'add' | 'multiply';

export interface LFOMapping {
    lfoId: string;
    effectId: string;
    parameterId: string;
    min: number;
    max: number;
    mode: ModulationMode;
}

export class LFOManager {
    public lfos: LFO[] = [];
    public mappings: LFOMapping[] = [];

    private listeners: Set<() => void> = new Set();

    /**
     * Create a new LFO
     */
    createLFO(name?: string, waveform: LFOWaveform = 'sine'): LFO {
        const lfo = new LFO(name || `LFO ${this.lfos.length + 1}`, { waveform });
        this.lfos.push(lfo);
        this.notifyListeners();
        return lfo;
    }

    /**
     * Remove an LFO and its mappings
     */
    removeLFO(id: string): void {
        this.lfos = this.lfos.filter(lfo => lfo.id !== id);
        this.mappings = this.mappings.filter(m => m.lfoId !== id);
        this.notifyListeners();
    }

    /**
     * Get LFO by ID
     */
    getLFO(id: string): LFO | undefined {
        return this.lfos.find(lfo => lfo.id === id);
    }

    /**
     * Map an LFO to an effect parameter
     */
    mapToParameter(
        lfoId: string,
        effectId: string,
        parameterId: string,
        min: number,
        max: number,
        mode: ModulationMode = 'replace'
    ): void {
        // Remove existing mapping for this parameter
        this.mappings = this.mappings.filter(
            m => !(m.effectId === effectId && m.parameterId === parameterId)
        );

        this.mappings.push({
            lfoId,
            effectId,
            parameterId,
            min,
            max,
            mode,
        });
        this.notifyListeners();
    }

    /**
     * Remove mapping for a parameter
     */
    unmapParameter(effectId: string, parameterId: string): void {
        this.mappings = this.mappings.filter(
            m => !(m.effectId === effectId && m.parameterId === parameterId)
        );
        this.notifyListeners();
    }

    /**
     * Get mapping for a specific parameter
     */
    getMappingForParameter(effectId: string, parameterId: string): LFOMapping | undefined {
        return this.mappings.find(
            m => m.effectId === effectId && m.parameterId === parameterId
        );
    }

    /**
     * Check if a parameter is modulated
     */
    isParameterModulated(effectId: string, parameterId: string): boolean {
        return this.mappings.some(
            m => m.effectId === effectId && m.parameterId === parameterId
        );
    }

    /**
     * Update all modulated parameters based on current time
     */
    update(time: number, effects: Effect[]): void {
        for (const mapping of this.mappings) {
            const lfo = this.getLFO(mapping.lfoId);
            if (!lfo || !lfo.enabled) continue;

            const effect = effects.find(e => e.id === mapping.effectId);
            if (!effect) continue;

            const param = effect.parameters.find(p => p.id === mapping.parameterId);
            if (!param) continue;

            const lfoValue = lfo.getValueInRange(time, mapping.min, mapping.max);
            const currentValue = effect.uniforms[mapping.parameterId]?.value;

            let newValue: number;
            switch (mapping.mode) {
                case 'add':
                    newValue = (currentValue || 0) + lfoValue;
                    break;
                case 'multiply':
                    newValue = (currentValue || 1) * lfoValue;
                    break;
                case 'replace':
                default:
                    newValue = lfoValue;
                    break;
            }

            // Clamp to parameter range if defined
            if (param.min !== undefined) newValue = Math.max(param.min, newValue);
            if (param.max !== undefined) newValue = Math.min(param.max, newValue);

            effect.uniforms[mapping.parameterId].value = newValue;
        }
    }

    /**
     * Subscribe to changes
     */
    onChange(callback: () => void): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notifyListeners(): void {
        this.listeners.forEach(cb => cb());
    }

    /**
     * Serialize state
     */
    toJSON(): { lfos: ReturnType<LFO['toJSON']>[]; mappings: LFOMapping[] } {
        return {
            lfos: this.lfos.map(lfo => lfo.toJSON()),
            mappings: [...this.mappings],
        };
    }

    /**
     * Load from serialized state
     */
    fromJSON(data: { lfos: ReturnType<LFO['toJSON']>[]; mappings: LFOMapping[] }): void {
        this.lfos = data.lfos.map(lfoData => {
            const lfo = new LFO(lfoData.name, {
                waveform: lfoData.waveform,
                frequency: lfoData.frequency,
                amplitude: lfoData.amplitude,
                offset: lfoData.offset,
                phase: lfoData.phase,
            });
            // Override the auto-generated ID with the saved one
            (lfo as { id: string }).id = lfoData.id;
            lfo.enabled = lfoData.enabled;
            return lfo;
        });
        this.mappings = [...data.mappings];
        this.notifyListeners();
    }
}
