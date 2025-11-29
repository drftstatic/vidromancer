import * as THREE from 'three';
import { AudioVisualizer } from './AudioVisualizer';
import { AudioManager } from '../../services/AudioManager';

/**
 * Classic bar spectrum analyzer visualization
 */
export class SpectrumVisualizer extends AudioVisualizer {
    private bars: THREE.Mesh[] = [];
    private barCount: number = 64;
    private barMaterial!: THREE.MeshBasicMaterial;
    private previousHeights: number[] = [];

    constructor(audioManager: AudioManager, width: number = 512, height: number = 512) {
        super(audioManager, width, height);
    }

    protected init(): void {
        this.createBars();
    }

    private createBars(): void {
        // Clear existing bars
        this.bars.forEach(bar => {
            this.scene.remove(bar);
            bar.geometry.dispose();
        });
        this.bars = [];
        this.previousHeights = new Array(this.barCount).fill(0);

        // Create material
        this.barMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.9
        });

        const barWidth = 2 / this.barCount;
        const gap = barWidth * 0.1;
        const actualBarWidth = barWidth - gap;

        for (let i = 0; i < this.barCount; i++) {
            const geometry = new THREE.PlaneGeometry(actualBarWidth, 1);
            const mesh = new THREE.Mesh(geometry, this.barMaterial.clone());

            // Position bar - start from left (-1) and move right
            const x = -1 + barWidth / 2 + i * barWidth;
            mesh.position.x = x;
            mesh.position.y = -1; // Start at bottom, will scale upward
            mesh.scale.y = 0.01; // Start with minimal height

            this.scene.add(mesh);
            this.bars.push(mesh);
        }
    }

    public setBarCount(count: number): void {
        this.barCount = Math.max(8, Math.min(256, count));
        this.createBars();
    }

    protected onColorChange(): void {
        this.bars.forEach((bar, i) => {
            const material = bar.material as THREE.MeshBasicMaterial;
            // Create gradient from primary to secondary color
            const t = i / this.barCount;
            material.color.copy(this.color).lerp(this.secondaryColor, t);
        });
    }

    public update(): void {
        const spectrum = this.audioManager.getSpectrum();
        if (!spectrum) return;

        // Map spectrum data to bars
        const binCount = spectrum.length;
        const binsPerBar = Math.floor(binCount / this.barCount);

        for (let i = 0; i < this.barCount; i++) {
            // Average the bins for this bar
            let sum = 0;
            const startBin = i * binsPerBar;
            const endBin = Math.min(startBin + binsPerBar, binCount);

            for (let j = startBin; j < endBin; j++) {
                sum += spectrum[j];
            }

            const average = sum / (endBin - startBin);
            const normalized = (average / 255) * this.intensity;

            // Smooth the value
            const smoothed = this.previousHeights[i] * this.smoothing +
                normalized * (1 - this.smoothing);
            this.previousHeights[i] = smoothed;

            // Scale the bar
            const height = Math.max(0.01, smoothed * 2); // Max height of 2 (full screen)
            this.bars[i].scale.y = height;
            this.bars[i].position.y = -1 + height / 2; // Anchor at bottom

            // Update color based on level (green -> yellow -> red)
            const material = this.bars[i].material as THREE.MeshBasicMaterial;
            if (smoothed > 0.8) {
                material.color.setHex(0xff3333); // Red for peaks
            } else if (smoothed > 0.6) {
                material.color.setHex(0xffaa33); // Yellow/amber
            } else {
                // Gradient from primary to secondary
                const t = i / this.barCount;
                material.color.copy(this.color).lerp(this.secondaryColor, t);
            }
        }
    }

    public dispose(): void {
        this.bars.forEach(bar => {
            const material = bar.material as THREE.MeshBasicMaterial;
            material.dispose();
        });
        super.dispose();
    }
}
