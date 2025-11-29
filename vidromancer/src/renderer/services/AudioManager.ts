import * as THREE from 'three';

export interface AudioDevice {
    deviceId: string;
    label: string;
}

export type AudioSourceType = 'mic' | 'clip' | 'file' | 'none';

export class AudioManager {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null;
    private stream: MediaStream | null = null;
    private dataArray: Uint8Array | null = null;
    private waveformArray: Uint8Array | null = null;

    // Gain nodes for control
    private inputGainNode: GainNode | null = null;
    private monitorGainNode: GainNode | null = null;

    // State
    private _inputGain: number = 1.0;
    private _monitorEnabled: boolean = false;
    private _monitorVolume: number = 0.5;
    private _sourceType: AudioSourceType = 'none';
    private _currentDeviceId: string = '';

    // Peak hold for VU meter
    private _peakLeft: number = 0;
    private _peakRight: number = 0;
    private _peakHold: number = 0;
    private _peakDecay: number = 0.95;
    private _peakHoldTime: number = 0;
    private _peakHoldDuration: number = 1000; // ms

    // Analysis values (0-1)
    public bass: number = 0;
    public mid: number = 0;
    public treble: number = 0;
    public volume: number = 0;

    // Textures for shaders
    private _spectrumTexture: THREE.DataTexture | null = null;
    private _waveformTexture: THREE.DataTexture | null = null;
    private spectrumData: Float32Array | null = null;
    private waveformData: Float32Array | null = null;

    // Connected media element (for clip audio)
    private connectedMediaElement: HTMLMediaElement | null = null;

    constructor() {
        // Initialize on user interaction usually
        this.initTextures();
    }

    private initTextures() {
        // Spectrum texture: 512x1 float texture
        this.spectrumData = new Float32Array(512);
        this._spectrumTexture = new THREE.DataTexture(
            this.spectrumData,
            512,
            1,
            THREE.RedFormat,
            THREE.FloatType
        );
        this._spectrumTexture.minFilter = THREE.LinearFilter;
        this._spectrumTexture.magFilter = THREE.LinearFilter;
        this._spectrumTexture.needsUpdate = true;

        // Waveform texture: 512x1 float texture
        this.waveformData = new Float32Array(512);
        this._waveformTexture = new THREE.DataTexture(
            this.waveformData,
            512,
            1,
            THREE.RedFormat,
            THREE.FloatType
        );
        this._waveformTexture.minFilter = THREE.LinearFilter;
        this._waveformTexture.magFilter = THREE.LinearFilter;
        this._waveformTexture.needsUpdate = true;
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

    private async ensureAudioContext(): Promise<AudioContext> {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        } else if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        return this.audioContext;
    }

    private setupAnalyser(ctx: AudioContext) {
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 1024;
        this.analyser.smoothingTimeConstant = 0.8;

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.waveformArray = new Uint8Array(bufferLength);
    }

    private setupGainNodes(ctx: AudioContext) {
        // Input gain (before analyser)
        this.inputGainNode = ctx.createGain();
        this.inputGainNode.gain.value = this._inputGain;

        // Monitor gain (to speakers)
        this.monitorGainNode = ctx.createGain();
        this.monitorGainNode.gain.value = this._monitorEnabled ? this._monitorVolume : 0;
        this.monitorGainNode.connect(ctx.destination);
    }

    async setInputDevice(deviceId: string) {
        // Stop existing stream
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
        }
        this.disconnectSource();

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: { exact: deviceId },
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false
                }
            });

            const ctx = await this.ensureAudioContext();

            if (!this.analyser) {
                this.setupAnalyser(ctx);
            }
            if (!this.inputGainNode || !this.monitorGainNode) {
                this.setupGainNodes(ctx);
            }

            this.source = ctx.createMediaStreamSource(this.stream);

            // Chain: source -> inputGain -> analyser -> monitorGain -> destination
            this.source.connect(this.inputGainNode!);
            this.inputGainNode!.connect(this.analyser!);
            this.analyser!.connect(this.monitorGainNode!);

            this._sourceType = 'mic';
            this._currentDeviceId = deviceId;

            console.log('Audio input connected:', deviceId);
        } catch (err) {
            console.error('Error accessing audio device:', err);
        }
    }

    async connectClipAudio(mediaElement: HTMLMediaElement) {
        this.disconnectSource();

        try {
            const ctx = await this.ensureAudioContext();

            if (!this.analyser) {
                this.setupAnalyser(ctx);
            }
            if (!this.inputGainNode || !this.monitorGainNode) {
                this.setupGainNodes(ctx);
            }

            // Create media element source
            this.source = ctx.createMediaElementSource(mediaElement);
            this.connectedMediaElement = mediaElement;

            // Chain: source -> inputGain -> analyser -> monitorGain -> destination
            this.source.connect(this.inputGainNode!);
            this.inputGainNode!.connect(this.analyser!);
            this.analyser!.connect(this.monitorGainNode!);

            this._sourceType = 'clip';

            console.log('Clip audio connected');
        } catch (err) {
            console.error('Error connecting clip audio:', err);
        }
    }

    async loadAudioFile(url: string): Promise<HTMLAudioElement | null> {
        this.disconnectSource();

        try {
            const ctx = await this.ensureAudioContext();

            if (!this.analyser) {
                this.setupAnalyser(ctx);
            }
            if (!this.inputGainNode || !this.monitorGainNode) {
                this.setupGainNodes(ctx);
            }

            // Create audio element for file
            const audio = new Audio(url);
            audio.crossOrigin = 'anonymous';
            audio.loop = true;

            this.source = ctx.createMediaElementSource(audio);
            this.connectedMediaElement = audio;

            // Chain: source -> inputGain -> analyser -> monitorGain -> destination
            this.source.connect(this.inputGainNode!);
            this.inputGainNode!.connect(this.analyser!);
            this.analyser!.connect(this.monitorGainNode!);

            this._sourceType = 'file';

            console.log('Audio file loaded:', url);
            return audio;
        } catch (err) {
            console.error('Error loading audio file:', err);
            return null;
        }
    }

    private disconnectSource() {
        if (this.source) {
            try {
                this.source.disconnect();
            } catch (e) {
                // Already disconnected
            }
            this.source = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        this.connectedMediaElement = null;
        this._sourceType = 'none';
    }

    // Gain control
    setInputGain(value: number) {
        this._inputGain = Math.max(0, Math.min(2, value));
        if (this.inputGainNode) {
            this.inputGainNode.gain.value = this._inputGain;
        }
    }

    getInputGain(): number {
        return this._inputGain;
    }

    // Monitor control
    setMonitoring(enabled: boolean, volume?: number) {
        this._monitorEnabled = enabled;
        if (volume !== undefined) {
            this._monitorVolume = Math.max(0, Math.min(1, volume));
        }
        if (this.monitorGainNode) {
            this.monitorGainNode.gain.value = this._monitorEnabled ? this._monitorVolume : 0;
        }
    }

    isMonitoringEnabled(): boolean {
        return this._monitorEnabled;
    }

    getMonitorVolume(): number {
        return this._monitorVolume;
    }

    setMonitorVolume(value: number) {
        this._monitorVolume = Math.max(0, Math.min(1, value));
        if (this.monitorGainNode && this._monitorEnabled) {
            this.monitorGainNode.gain.value = this._monitorVolume;
        }
    }

    // Source info
    getActiveSource(): AudioSourceType {
        return this._sourceType;
    }

    getCurrentDeviceId(): string {
        return this._currentDeviceId;
    }

    getConnectedMediaElement(): HTMLMediaElement | null {
        return this.connectedMediaElement;
    }

    update() {
        if (!this.analyser || !this.dataArray || !this.waveformArray) return;

        this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);
        this.analyser.getByteTimeDomainData(this.waveformArray as Uint8Array<ArrayBuffer>);

        // Calculate bands
        const bassRange = [0, 10]; // ~0-430Hz
        const midRange = [11, 100]; // ~470Hz - 4.3kHz
        const trebleRange = [101, 511]; // ~4.3kHz - 22kHz

        this.bass = this.getAverageRange(bassRange[0], bassRange[1]);
        this.mid = this.getAverageRange(midRange[0], midRange[1]);
        this.treble = this.getAverageRange(trebleRange[0], trebleRange[1]);

        // Volume (RMS of waveform)
        let sum = 0;
        let maxSample = 0;
        for (let i = 0; i < this.waveformArray.length; i++) {
            const amplitude = (this.waveformArray[i] - 128) / 128;
            sum += amplitude * amplitude;
            maxSample = Math.max(maxSample, Math.abs(amplitude));
        }
        this.volume = Math.sqrt(sum / this.waveformArray.length);
        this.volume = Math.min(1, this.volume * 2);

        // Update peak levels for VU meter
        this.updatePeakLevels(maxSample);

        // Update textures for shaders
        this.updateTextures();
    }

    private updatePeakLevels(currentPeak: number) {
        const now = Date.now();

        // Simple mono peak for now (could split L/R with stereo analyser)
        const level = currentPeak;

        // Update instantaneous peaks
        this._peakLeft = level;
        this._peakRight = level;

        // Update peak hold
        if (level > this._peakHold) {
            this._peakHold = level;
            this._peakHoldTime = now;
        } else if (now - this._peakHoldTime > this._peakHoldDuration) {
            // Decay peak hold
            this._peakHold *= this._peakDecay;
        }
    }

    private updateTextures() {
        if (!this.dataArray || !this.waveformArray) return;

        // Update spectrum texture
        if (this.spectrumData && this._spectrumTexture) {
            for (let i = 0; i < 512; i++) {
                this.spectrumData[i] = this.dataArray[i] / 255;
            }
            this._spectrumTexture.needsUpdate = true;
        }

        // Update waveform texture
        if (this.waveformData && this._waveformTexture) {
            for (let i = 0; i < 512; i++) {
                this.waveformData[i] = (this.waveformArray[i] - 128) / 128;
            }
            this._waveformTexture.needsUpdate = true;
        }
    }

    private getAverageRange(start: number, end: number): number {
        if (!this.dataArray) return 0;
        let sum = 0;
        for (let i = start; i <= end; i++) {
            sum += this.dataArray[i];
        }
        return (sum / (end - start + 1)) / 255;
    }

    // Texture getters for shaders
    getSpectrumTexture(): THREE.DataTexture | null {
        return this._spectrumTexture;
    }

    getWaveformTexture(): THREE.DataTexture | null {
        return this._waveformTexture;
    }

    // Raw data getters
    getWaveform(): Uint8Array | null {
        return this.waveformArray;
    }

    getSpectrum(): Uint8Array | null {
        return this.dataArray;
    }

    // Peak levels for VU meter
    getPeakLevels(): { left: number; right: number; peak: number } {
        return {
            left: this._peakLeft,
            right: this._peakRight,
            peak: this._peakHold
        };
    }

    // Get levels for VU meter (0-1, with logarithmic scaling for dB-like response)
    getVULevels(): { left: number; right: number; peak: number } {
        // Apply pseudo-dB scaling (makes meter more responsive like real VU)
        const toVU = (linear: number): number => {
            if (linear <= 0) return 0;
            // Logarithmic response
            const db = 20 * Math.log10(linear);
            // Map -60dB to 0dB -> 0 to 1
            const normalized = (db + 60) / 60;
            return Math.max(0, Math.min(1, normalized));
        };

        return {
            left: toVU(this._peakLeft),
            right: toVU(this._peakRight),
            peak: toVU(this._peakHold)
        };
    }

    dispose() {
        this.disconnectSource();
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this._spectrumTexture) {
            this._spectrumTexture.dispose();
        }
        if (this._waveformTexture) {
            this._waveformTexture.dispose();
        }
    }
}
