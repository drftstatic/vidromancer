export type LFOWaveform = 'sine' | 'square' | 'saw' | 'triangle' | 'random';

export interface LFOConfig {
    waveform: LFOWaveform;
    frequency: number;  // Hz
    amplitude: number;  // 0-1
    offset: number;     // -1 to 1
    phase: number;      // 0 to 2π
}

export class LFO {
    public id: string;
    public name: string;
    public waveform: LFOWaveform;
    public frequency: number;
    public amplitude: number;
    public offset: number;
    public phase: number;
    public enabled: boolean = true;

    private lastRandomValue: number = 0;
    private lastRandomTime: number = 0;

    constructor(name: string = 'LFO', config?: Partial<LFOConfig>) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.waveform = config?.waveform || 'sine';
        this.frequency = config?.frequency || 1;
        this.amplitude = config?.amplitude || 1;
        this.offset = config?.offset || 0;
        this.phase = config?.phase || 0;
    }

    /**
     * Get the current value of the LFO at a given time
     * @param time Time in seconds
     * @returns Value between -1 and 1 (before offset applied), then scaled by amplitude
     */
    getValue(time: number): number {
        if (!this.enabled) return 0;

        const t = (time * this.frequency + this.phase / (2 * Math.PI)) % 1;
        let value: number;

        switch (this.waveform) {
            case 'sine':
                value = Math.sin(t * 2 * Math.PI);
                break;
            case 'square':
                value = t < 0.5 ? 1 : -1;
                break;
            case 'saw':
                value = t * 2 - 1;
                break;
            case 'triangle':
                value = Math.abs((t * 4) % 4 - 2) - 1;
                break;
            case 'random': {
                // Sample and hold random - new value each cycle
                const cycleTime = Math.floor(time * this.frequency);
                if (cycleTime !== this.lastRandomTime) {
                    this.lastRandomValue = Math.random() * 2 - 1;
                    this.lastRandomTime = cycleTime;
                }
                value = this.lastRandomValue;
                break;
            }
            default:
                value = 0;
        }

        return (value * this.amplitude) + this.offset;
    }

    /**
     * Get value mapped to a specific range
     */
    getValueInRange(time: number, min: number, max: number): number {
        const normalizedValue = (this.getValue(time) + 1) / 2; // Convert -1..1 to 0..1
        return min + normalizedValue * (max - min);
    }

    /**
     * Clone this LFO with a new ID
     */
    clone(): LFO {
        const lfo = new LFO(this.name + ' Copy', {
            waveform: this.waveform,
            frequency: this.frequency,
            amplitude: this.amplitude,
            offset: this.offset,
            phase: this.phase,
        });
        lfo.enabled = this.enabled;
        return lfo;
    }

    /**
     * Serialize to JSON
     */
    toJSON(): LFOConfig & { id: string; name: string; enabled: boolean } {
        return {
            id: this.id,
            name: this.name,
            waveform: this.waveform,
            frequency: this.frequency,
            amplitude: this.amplitude,
            offset: this.offset,
            phase: this.phase,
            enabled: this.enabled,
        };
    }
}
