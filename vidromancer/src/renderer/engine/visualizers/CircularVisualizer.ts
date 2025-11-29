import * as THREE from 'three';
import { AudioVisualizer } from './AudioVisualizer';
import { AudioManager } from '../../services/AudioManager';

/**
 * Radial/circular spectrum visualization - popular VJ style
 */
export class CircularVisualizer extends AudioVisualizer {
    private lines: THREE.Line[] = [];
    private barCount: number = 64;
    private innerRadius: number = 0.2;
    private previousHeights: number[] = [];
    private rotation: number = 0;
    private rotationSpeed: number = 0.002;
    private mirror: boolean = true;

    constructor(audioManager: AudioManager, width: number = 512, height: number = 512) {
        super(audioManager, width, height);
    }

    protected init(): void {
        this.createBars();
    }

    private createBars(): void {
        // Clear existing lines
        this.lines.forEach(line => {
            this.scene.remove(line);
            line.geometry.dispose();
            (line.material as THREE.Material).dispose();
        });
        this.lines = [];
        this.previousHeights = new Array(this.barCount).fill(0);

        const angleStep = (Math.PI * 2) / this.barCount;

        for (let i = 0; i < this.barCount; i++) {
            const angle = i * angleStep;

            // Create line from inner to outer radius
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6); // 2 points * 3 components

            // Inner point
            positions[0] = Math.cos(angle) * this.innerRadius;
            positions[1] = Math.sin(angle) * this.innerRadius;
            positions[2] = 0;

            // Outer point (will be updated in update())
            positions[3] = Math.cos(angle) * this.innerRadius;
            positions[4] = Math.sin(angle) * this.innerRadius;
            positions[5] = 0;

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            // Color based on position in spectrum
            const hue = i / this.barCount;
            const color = new THREE.Color().setHSL(hue, 1, 0.5);

            const material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 2,
                transparent: true,
                opacity: 0.9
            });

            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
            this.lines.push(line);
        }
    }

    public setBarCount(count: number): void {
        this.barCount = Math.max(16, Math.min(128, count));
        this.createBars();
    }

    public setInnerRadius(radius: number): void {
        this.innerRadius = Math.max(0.05, Math.min(0.5, radius));
        this.createBars();
    }

    public setRotationSpeed(speed: number): void {
        this.rotationSpeed = speed;
    }

    public setMirror(enabled: boolean): void {
        this.mirror = enabled;
    }

    protected onColorChange(): void {
        // Circular visualizer uses HSL spectrum colors by default
        // Can override to use primary/secondary colors
        this.lines.forEach((line, i) => {
            const material = line.material as THREE.LineBasicMaterial;
            const t = i / this.barCount;
            material.color.copy(this.color).lerp(this.secondaryColor, t);
        });
    }

    public update(): void {
        const spectrum = this.audioManager.getSpectrum();
        if (!spectrum) return;

        // Rotate the visualization
        this.rotation += this.rotationSpeed;

        const binCount = spectrum.length;
        const usableBins = Math.floor(binCount / 2); // Use lower half of spectrum
        const binsPerBar = Math.floor(usableBins / this.barCount);
        const angleStep = (Math.PI * 2) / this.barCount;

        for (let i = 0; i < this.barCount; i++) {
            // Get spectrum value for this bar
            const binIndex = this.mirror
                ? Math.abs(i - this.barCount / 2) * binsPerBar
                : i * binsPerBar;

            let sum = 0;
            for (let j = 0; j < binsPerBar; j++) {
                const idx = Math.min(binIndex + j, usableBins - 1);
                sum += spectrum[idx];
            }

            const average = sum / binsPerBar;
            const normalized = (average / 255) * this.intensity;

            // Smooth the value
            const smoothed = this.previousHeights[i] * this.smoothing +
                normalized * (1 - this.smoothing);
            this.previousHeights[i] = smoothed;

            // Calculate outer radius based on audio level
            const maxRadius = 0.9;
            const outerRadius = this.innerRadius + smoothed * (maxRadius - this.innerRadius);

            // Update line positions
            const angle = i * angleStep + this.rotation;
            const positions = this.lines[i].geometry.attributes.position.array as Float32Array;

            // Inner point
            positions[0] = Math.cos(angle) * this.innerRadius;
            positions[1] = Math.sin(angle) * this.innerRadius;

            // Outer point
            positions[3] = Math.cos(angle) * outerRadius;
            positions[4] = Math.sin(angle) * outerRadius;

            this.lines[i].geometry.attributes.position.needsUpdate = true;

            // Update color based on level
            const material = this.lines[i].material as THREE.LineBasicMaterial;
            const hue = (i / this.barCount + this.rotation / Math.PI) % 1;
            const saturation = 0.8 + smoothed * 0.2;
            const lightness = 0.4 + smoothed * 0.3;
            material.color.setHSL(hue, saturation, lightness);
            material.opacity = 0.5 + smoothed * 0.5;
        }
    }

    public dispose(): void {
        this.lines.forEach(line => {
            (line.material as THREE.Material).dispose();
        });
        super.dispose();
    }
}
