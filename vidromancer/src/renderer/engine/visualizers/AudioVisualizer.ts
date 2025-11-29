import * as THREE from 'three';
import { AudioManager } from '../../services/AudioManager';

export type AudioVisualizerType = 'spectrum' | 'waveform' | 'circular' | 'none';

/**
 * Base class for audio visualizers that render to a texture
 */
export abstract class AudioVisualizer {
    protected audioManager: AudioManager;
    protected scene: THREE.Scene;
    protected camera: THREE.OrthographicCamera;
    protected renderTarget: THREE.WebGLRenderTarget;
    protected width: number;
    protected height: number;

    // Customizable properties
    public color: THREE.Color = new THREE.Color(0x33ff66);
    public secondaryColor: THREE.Color = new THREE.Color(0xff6633);
    public backgroundColor: THREE.Color = new THREE.Color(0x000000);
    public intensity: number = 1.0;
    public smoothing: number = 0.8;

    constructor(audioManager: AudioManager, width: number = 512, height: number = 512) {
        this.audioManager = audioManager;
        this.width = width;
        this.height = height;

        // Create scene for visualizer
        this.scene = new THREE.Scene();
        this.scene.background = this.backgroundColor;

        // Orthographic camera for 2D rendering
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 1;

        // Create render target
        this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });

        this.init();
    }

    /**
     * Initialize visualizer-specific geometry and materials
     */
    protected abstract init(): void;

    /**
     * Update visualizer state based on current audio data
     */
    public abstract update(): void;

    /**
     * Render the visualizer to its render target
     */
    public render(renderer: THREE.WebGLRenderer): void {
        this.update();
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, this.camera);
        renderer.setRenderTarget(null);
    }

    /**
     * Get the rendered texture
     */
    public getTexture(): THREE.Texture {
        return this.renderTarget.texture;
    }

    /**
     * Set primary color
     */
    public setColor(color: THREE.Color | string | number): void {
        if (color instanceof THREE.Color) {
            this.color = color;
        } else {
            this.color = new THREE.Color(color);
        }
        this.onColorChange();
    }

    /**
     * Set secondary color
     */
    public setSecondaryColor(color: THREE.Color | string | number): void {
        if (color instanceof THREE.Color) {
            this.secondaryColor = color;
        } else {
            this.secondaryColor = new THREE.Color(color);
        }
        this.onColorChange();
    }

    /**
     * Called when colors change - override in subclasses
     */
    protected onColorChange(): void {
        // Override in subclasses
    }

    /**
     * Set background color
     */
    public setBackgroundColor(color: THREE.Color | string | number): void {
        if (color instanceof THREE.Color) {
            this.backgroundColor = color;
        } else {
            this.backgroundColor = new THREE.Color(color);
        }
        this.scene.background = this.backgroundColor;
    }

    /**
     * Set intensity (0-2)
     */
    public setIntensity(value: number): void {
        this.intensity = Math.max(0, Math.min(2, value));
    }

    /**
     * Set smoothing (0-0.99)
     */
    public setSmoothing(value: number): void {
        this.smoothing = Math.max(0, Math.min(0.99, value));
    }

    /**
     * Resize the visualizer
     */
    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.renderTarget.setSize(width, height);
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.renderTarget.dispose();
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (object.material instanceof THREE.Material) {
                    object.material.dispose();
                }
            }
        });
    }
}
