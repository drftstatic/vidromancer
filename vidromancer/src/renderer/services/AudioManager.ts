export interface AudioDevice {
    deviceId: string;
    label: string;
}

export class AudioManager {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private stream: MediaStream | null = null;
    private dataArray: Uint8Array | null = null;
    private waveformArray: Uint8Array | null = null;

    // Analysis values (0-1)
    public bass: number = 0;
    public mid: number = 0;
    public treble: number = 0;
    public volume: number = 0;

    constructor() {
        // Initialize on user interaction usually, but we'll prepare
    }

    async getDevices(): Promise<AudioDevice[]> {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices
            .filter(d => d.kind === 'audioinput')
            .map(d => ({
                deviceId: d.deviceId,
                label: d.label || `Microphone ${d.deviceId.slice(0, 5)}...`
            }));
    }

    async setInputDevice(deviceId: string) {
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: { exact: deviceId },
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false
                }
            });

            if (!this.audioContext) {
                this.audioContext = new AudioContext();
            } else if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.8;

            this.source = this.audioContext.createMediaStreamSource(this.stream);
            this.source.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            this.waveformArray = new Uint8Array(bufferLength);

            console.log('Audio input connected:', deviceId);
        } catch (err) {
            console.error('Error accessing audio device:', err);
        }
    }

    update() {
        if (!this.analyser || !this.dataArray || !this.waveformArray) return;

        this.analyser.getByteFrequencyData(this.dataArray as any);
        this.analyser.getByteTimeDomainData(this.waveformArray as any);

        // Calculate bands
        // FFT size 1024 -> 512 bins. Sample rate usually 44.1kHz or 48kHz.
        // Bin width approx 43Hz.

        const bassRange = [0, 10]; // ~0-430Hz
        const midRange = [11, 100]; // ~470Hz - 4.3kHz
        const trebleRange = [101, 511]; // ~4.3kHz - 22kHz

        this.bass = this.getAverageRange(bassRange[0], bassRange[1]);
        this.mid = this.getAverageRange(midRange[0], midRange[1]);
        this.treble = this.getAverageRange(trebleRange[0], trebleRange[1]);

        // Volume (RMS of waveform)
        let sum = 0;
        for (let i = 0; i < this.waveformArray.length; i++) {
            const amplitude = (this.waveformArray[i] - 128) / 128;
            sum += amplitude * amplitude;
        }
        this.volume = Math.sqrt(sum / this.waveformArray.length);

        // Boost volume a bit to make it more usable
        this.volume = Math.min(1, this.volume * 2);
    }

    private getAverageRange(start: number, end: number): number {
        if (!this.dataArray) return 0;
        let sum = 0;
        for (let i = start; i <= end; i++) {
            sum += this.dataArray[i];
        }
        return (sum / (end - start + 1)) / 255;
    }

    getWaveform(): Uint8Array | null {
        return this.waveformArray;
    }

    getSpectrum(): Uint8Array | null {
        return this.dataArray;
    }

    dispose() {
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
