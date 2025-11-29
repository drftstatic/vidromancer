import * as THREE from 'three';
import { AudioManager } from '../services/AudioManager';
import { AudioVisualizer } from './visualizers/AudioVisualizer';
import { SpectrumVisualizer } from './visualizers/SpectrumVisualizer';
import { WaveformVisualizer } from './visualizers/WaveformVisualizer';
import { CircularVisualizer } from './visualizers/CircularVisualizer';
import { BlendMode } from './Mixer';

export type AudioVisualizerType = 'spectrum' | 'waveform' | 'circular' | 'none';

/**
 * AudioLayer - Compositable audio visualization layer
 *
 * This layer renders audio visualizations that can be blended
 * on top of video output with opacity and blend mode controls.
 * Designed as a "first-class" layer alongside video sources.
 */
export class AudioLayer {
    private audioManager: AudioManager;
    private visualizer: AudioVisualizer | null = null;
    private visualizerType: AudioVisualizerType = 'none';

    // Compositing
    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private mesh: THREE.Mesh;
    private material: THREE.ShaderMaterial;
    private renderTarget: THREE.WebGLRenderTarget;

    // Layer properties
    private _opacity: number = 1.0;
    private _blendMode: BlendMode = 'add';
    private _enabled: boolean = true;
    private _width: number = 1280;
    private _height: number = 720;

    // Visualizer settings
    private _color: THREE.Color = new THREE.Color(0x00ffff);
    private _secondaryColor: THREE.Color = new THREE.Color(0xff00ff);
    private _intensity: number = 1.0;
    private _smoothing: number = 0.8;

    constructor(audioManager: AudioManager, width: number = 1280, height: number = 720) {
        this.audioManager = audioManager;
        this._width = width;
        this._height = height;

        // Set up compositing pipeline
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        });

        // Shader for compositing audio layer over base texture
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                audioTexture: { value: null },
                opacity: { value: this._opacity },
                blendMode: { value: 1 }, // Default to 'add'
                enabled: { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D baseTexture;
                uniform sampler2D audioTexture;
                uniform float opacity;
                uniform int blendMode;
                uniform float enabled;
                varying vec2 vUv;

                void main() {
                    vec4 base = texture2D(baseTexture, vUv);
                    vec4 audio = texture2D(audioTexture, vUv);

                    // If disabled, just return base
                    if (enabled < 0.5) {
                        gl_FragColor = base;
                        return;
                    }

                    // Apply opacity to audio layer
                    audio.a *= opacity;

                    vec3 result = base.rgb;

                    // Blend modes
                    if (blendMode == 0) {
                        // Normal - alpha blend
                        result = mix(base.rgb, audio.rgb, audio.a);
                    } else if (blendMode == 1) {
                        // Add
                        result = base.rgb + audio.rgb * audio.a;
                    } else if (blendMode == 2) {
                        // Multiply
                        vec3 multiplied = base.rgb * audio.rgb;
                        result = mix(base.rgb, multiplied, audio.a);
                    } else if (blendMode == 3) {
                        // Screen
                        vec3 screened = 1.0 - (1.0 - base.rgb) * (1.0 - audio.rgb);
                        result = mix(base.rgb, screened, audio.a);
                    } else if (blendMode == 4) {
                        // Overlay
                        vec3 overlay;
                        for (int i = 0; i < 3; i++) {
                            if (base[i] < 0.5) {
                                overlay[i] = 2.0 * base[i] * audio[i];
                            } else {
                                overlay[i] = 1.0 - 2.0 * (1.0 - base[i]) * (1.0 - audio[i]);
                            }
                        }
                        result = mix(base.rgb, overlay, audio.a);
                    } else if (blendMode == 5) {
                        // Difference
                        vec3 diff = abs(base.rgb - audio.rgb);
                        result = mix(base.rgb, diff, audio.a);
                    }

                    gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
                }
            `,
            transparent: true
        });

        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.scene.add(this.mesh);
    }

    /**
     * Set the visualizer type
     */
    setVisualizerType(type: AudioVisualizerType): void {
        if (type === this.visualizerType) return;

        // Dispose old visualizer
        if (this.visualizer) {
            this.visualizer.dispose();
            this.visualizer = null;
        }

        this.visualizerType = type;

        // Create new visualizer
        switch (type) {
            case 'spectrum':
                this.visualizer = new SpectrumVisualizer(this.audioManager, this._width, this._height);
                break;
            case 'waveform':
                this.visualizer = new WaveformVisualizer(this.audioManager, this._width, this._height);
                break;
            case 'circular':
                this.visualizer = new CircularVisualizer(this.audioManager, this._width, this._height);
                break;
            case 'none':
            default:
                this.visualizer = null;
                break;
        }

        // Apply current settings to new visualizer
        if (this.visualizer) {
            this.visualizer.setColor(this._color);
            this.visualizer.setSecondaryColor(this._secondaryColor);
            this.visualizer.setIntensity(this._intensity);
            this.visualizer.setSmoothing(this._smoothing);
        }
    }

    /**
     * Get current visualizer type
     */
    getVisualizerType(): AudioVisualizerType {
        return this.visualizerType;
    }

    /**
     * Set layer opacity (0-1)
     */
    setOpacity(value: number): void {
        this._opacity = Math.max(0, Math.min(1, value));
        this.material.uniforms.opacity.value = this._opacity;
    }

    getOpacity(): number {
        return this._opacity;
    }

    /**
     * Set blend mode
     */
    setBlendMode(mode: BlendMode): void {
        this._blendMode = mode;
        const modeMap: Record<BlendMode, number> = {
            'normal': 0, 'add': 1, 'multiply': 2, 'screen': 3, 'overlay': 4, 'difference': 5
        };
        this.material.uniforms.blendMode.value = modeMap[mode];
    }

    getBlendMode(): BlendMode {
        return this._blendMode;
    }

    /**
     * Enable/disable the layer
     */
    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
        this.material.uniforms.enabled.value = enabled ? 1.0 : 0.0;
    }

    isEnabled(): boolean {
        return this._enabled;
    }

    /**
     * Set visualizer primary color
     */
    setColor(color: THREE.Color | string | number): void {
        if (color instanceof THREE.Color) {
            this._color.copy(color);
        } else {
            this._color.set(color);
        }
        if (this.visualizer) {
            this.visualizer.setColor(this._color);
        }
    }

    /**
     * Set visualizer secondary color
     */
    setSecondaryColor(color: THREE.Color | string | number): void {
        if (color instanceof THREE.Color) {
            this._secondaryColor.copy(color);
        } else {
            this._secondaryColor.set(color);
        }
        if (this.visualizer) {
            this.visualizer.setSecondaryColor(this._secondaryColor);
        }
    }

    /**
     * Set visualizer intensity
     */
    setIntensity(value: number): void {
        this._intensity = Math.max(0, Math.min(2, value));
        if (this.visualizer) {
            this.visualizer.setIntensity(this._intensity);
        }
    }

    getIntensity(): number {
        return this._intensity;
    }

    /**
     * Set visualizer smoothing
     */
    setSmoothing(value: number): void {
        this._smoothing = Math.max(0, Math.min(0.99, value));
        if (this.visualizer) {
            this.visualizer.setSmoothing(this._smoothing);
        }
    }

    getSmoothing(): number {
        return this._smoothing;
    }

    /**
     * Get the visualizer instance for type-specific settings
     */
    getVisualizer(): AudioVisualizer | null {
        return this.visualizer;
    }

    /**
     * Update the visualizer (call each frame)
     */
    update(): void {
        if (this.visualizer && this._enabled) {
            this.visualizer.update();
        }
    }

    /**
     * Render the audio layer composited over base texture
     * @param renderer WebGL renderer
     * @param baseTexture The video/mixed texture to composite over
     * @returns The composited texture
     */
    render(renderer: THREE.WebGLRenderer, baseTexture: THREE.Texture): THREE.Texture {
        // If disabled or no visualizer, just return base texture
        if (!this._enabled || !this.visualizer) {
            return baseTexture;
        }

        // Render the visualizer to its internal render target
        this.visualizer.render(renderer);

        // Composite audio over base
        this.material.uniforms.baseTexture.value = baseTexture;
        this.material.uniforms.audioTexture.value = this.visualizer.getTexture();

        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, this.camera);
        renderer.setRenderTarget(null);

        return this.renderTarget.texture;
    }

    /**
     * Get the raw visualizer texture (without compositing)
     */
    getVisualizerTexture(): THREE.Texture | null {
        return this.visualizer ? this.visualizer.getTexture() : null;
    }

    /**
     * Set render size
     */
    setSize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        this.renderTarget.setSize(width, height);
        if (this.visualizer) {
            this.visualizer.setSize(width, height);
        }
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        if (this.visualizer) {
            this.visualizer.dispose();
        }
        this.material.dispose();
        this.renderTarget.dispose();
        (this.mesh.geometry as THREE.BufferGeometry).dispose();
    }
}
