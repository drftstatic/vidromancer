export type MidiCallback = (value: number) => void;

export class MidiManager {
    private access: WebMidi.MIDIAccess | null = null;
    mappings: Map<string, MidiCallback> = new Map();
    mappingIds: Map<string, string> = new Map(); // Store friendly names or IDs for persistence
    isLearning: boolean = false;
    learnCallback: ((id: string) => void) | null = null;
    selectedInputId: string | null = null;
    inputs: WebMidi.MIDIInput[] = [];

    async init() {
        this.loadMappings();
        try {
            if (navigator.requestMIDIAccess) {
                this.access = await navigator.requestMIDIAccess();
                this.updateInputs();

                this.access.onstatechange = () => {
                    this.updateInputs();
                };
            }
        } catch (err) {
            console.warn('MIDI access denied or not available', err);
        }
    }

    updateInputs() {
        if (!this.access) return;
        this.inputs = Array.from(this.access.inputs.values());

        // Re-bind listeners
        this.inputs.forEach(input => {
            input.onmidimessage = (e) => this.handleMessage(e);
        });
    }

    handleMessage(e: WebMidi.MIDIMessageEvent) {
        if (!e.data) return;

        // Filter by selected device if one is chosen
        if (this.selectedInputId && (e.target as WebMidi.MIDIInput).id !== this.selectedInputId) {
            return;
        }

        const [status, data1, data2] = e.data;
        const channel = status & 0x0f;
        const type = status & 0xf0;

        if (type === 0xB0) { // Control Change
            const id = `${channel}:${data1}`;
            const value = data2 / 127.0;

            if (this.isLearning && this.learnCallback) {
                this.learnCallback(id);
                this.isLearning = false;
                this.learnCallback = null;
                return;
            }

            const callback = this.mappings.get(id);
            if (callback) {
                callback(value);
            }
        }
    }

    map(id: string, callback: MidiCallback) {
        this.mappings.set(id, callback);
        this.saveMappings();
    }

    unmap(id: string) {
        this.mappings.delete(id);
        this.saveMappings();
    }

    learn(onLearn: (id: string) => void) {
        this.isLearning = true;
        this.learnCallback = onLearn;
    }

    cancelLearn() {
        this.isLearning = false;
        this.learnCallback = null;
    }

    getInputs(): { id: string, name: string }[] {
        return this.inputs.map(input => ({
            id: input.id,
            name: input.name || 'Unknown Device'
        }));
    }

    selectInput(id: string | null) {
        this.selectedInputId = id;
    }

    saveMappings() {
        // We only save the keys (MIDI IDs), not the callbacks
        const keys = Array.from(this.mappings.keys());
        localStorage.setItem('midi_mappings', JSON.stringify(keys));
    }

    loadMappings() {
        const stored = localStorage.getItem('midi_mappings');
        if (stored) {
            // We can't fully restore mappings without the target callbacks, 
            // but we can at least know which MIDI IDs were mapped.
            // In a real app, we'd need a way to re-associate these with specific UI parameters.
            // For now, we'll just acknowledge the persistence mechanism is in place.
            // A more robust system would map MIDI ID -> Parameter ID.
            // Let's implement a simple registry for parameter callbacks to fully support this.
        }
    }

    // Registry to allow re-binding callbacks on load
    private paramRegistry: Map<string, (val: number) => void> = new Map();

    registerParam(paramId: string, callback: (val: number) => void) {
        this.paramRegistry.set(paramId, callback);
        // If we have a saved mapping for this param, restore it
        const savedMidiId = this.getSavedMidiIdForParam(paramId);
        if (savedMidiId) {
            this.map(savedMidiId, callback);
        }
    }

    // Helper to store which MIDI ID maps to which Param ID
    // This requires us to change how we map. 
    // Instead of just map(midiId, callback), we need map(midiId, paramId, callback)

    // Updating map signature to support persistence
    mapParameter(midiId: string, paramId: string, callback: MidiCallback) {
        this.mappings.set(midiId, callback);

        // Save the association: ParamID -> MidiID
        const paramMap = this.getParamMap();
        paramMap[paramId] = midiId;
        localStorage.setItem('midi_param_map', JSON.stringify(paramMap));
    }

    getParamMap(): Record<string, string> {
        try {
            return JSON.parse(localStorage.getItem('midi_param_map') || '{}');
        } catch {
            return {};
        }
    }

    getSavedMidiIdForParam(paramId: string): string | undefined {
        const map = this.getParamMap();
        return map[paramId];
    }
}
