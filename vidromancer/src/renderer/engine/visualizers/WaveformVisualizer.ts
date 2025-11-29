import * as THREE from 'three';
import { AudioVisualizer } from './AudioVisualizer';
import { AudioManager } from '../../services/AudioManager';

/**
 * Oscilloscope-style waveform visualization
 */
export class WaveformVisualizer extends AudioVisualizer {
    private line!: THREE.Line;
    private lineMaterial!: THREE.LineBasicMaterial;
    private geometry!: THREE.BufferGeometry;
    private positions!: Float32Array;
    private sampleCount: number = 256;

    // Style options
    public lineWidth: number = 2;
    public glow: boolean = true;
    private glowLine: THREE.Line | null = null;

    constructor(audioManager: AudioManager, width: number = 512, height: number = 512) {
        super(audioManager, width, height);
    }

    protected init(): void {
        this.createWaveform();
    }

    private createWaveform(): void {
        // Create positions array
        this.positions = new Float32Array(this.sampleCount * 3);

        // Initialize positions along X axis
        for (let i = 0; i < this.sampleCount; i++) {
            const x = (i / (this.sampleCount - 1)) * 2 - 1; // -1 to 1
            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = 0;
            this.positions[i * 3 + 2] = 0;
        }

        // Create geometry
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        // Create material
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: this.color,
            linewidth: this.lineWidth,
            transparent: true,
            opacity: 1.0
        });

        // Create line
        this.line = new THREE.Line(this.geometry, this.lineMaterial);
        this.scene.add(this.line);

        // Create glow effect (larger, more transparent line behind)
        if (this.glow) {
            const glowMaterial = new THREE.LineBasicMaterial({
                color: this.color,
                linewidth: this.lineWidth * 3,
                transparent: true,
                opacity: 0.3
            });
            this.glowLine = new THREE.Line(this.geometry, glowMaterial);
            this.glowLine.position.z = -0.01;
            this.scene.add(this.glowLine);
        }
    }

    public setSampleCount(count: number): void {
        this.sampleCount = Math.max(64, Math.min(512, count));
        this.scene.remove(this.line);
        if (this.glowLine) {
            this.scene.remove(this.glowLine);
        }
        this.geometry.dispose();
        this.createWaveform();
    }

    protected onColorChange(): void {
        this.lineMaterial.color.copy(this.color);
        if (this.glowLine) {
            (this.glowLine.material as THREE.LineBasicMaterial).color.copy(this.color);
        }
    }

    public update(): void {
        const waveform = this.audioManager.getWaveform();
        if (!waveform) return;

        const dataLength = waveform.length;
        const step = Math.floor(dataLength / this.sampleCount);

        // Update Y positions based on waveform data
        for (let i = 0; i < this.sampleCount; i++) {
            const dataIndex = Math.min(i * step, dataLength - 1);
            // Convert from 0-255 to -1 to 1
            const value = ((waveform[dataIndex] - 128) / 128) * this.intensity;
            this.positions[i * 3 + 1] = value;
        }

        // Update geometry
        this.geometry.attributes.position.needsUpdate = true;

        // Update color based on audio level
        const level = this.audioManager.volume;
        if (level > 0.8) {
            this.lineMaterial.color.setHex(0xff3333);
        } else if (level > 0.5) {
            this.lineMaterial.color.copy(this.secondaryColor);
        } else {
            this.lineMaterial.color.copy(this.color);
        }

        if (this.glowLine) {
            (this.glowLine.material as THREE.LineBasicMaterial).color.copy(this.lineMaterial.color);
        }
    }

    public setGlow(enabled: boolean): void {
        if (this.glow === enabled) return;

        this.glow = enabled;
        if (enabled && !this.glowLine) {
            const glowMaterial = new THREE.LineBasicMaterial({
                color: this.color,
                linewidth: this.lineWidth * 3,
                transparent: true,
                opacity: 0.3
            });
            this.glowLine = new THREE.Line(this.geometry, glowMaterial);
            this.glowLine.position.z = -0.01;
            this.scene.add(this.glowLine);
        } else if (!enabled && this.glowLine) {
            this.scene.remove(this.glowLine);
            (this.glowLine.material as THREE.Material).dispose();
            this.glowLine = null;
        }
    }

    public dispose(): void {
        this.lineMaterial.dispose();
        if (this.glowLine) {
            (this.glowLine.material as THREE.Material).dispose();
        }
        super.dispose();
    }
}
