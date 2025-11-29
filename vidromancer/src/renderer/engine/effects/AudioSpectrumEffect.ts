import * as THREE from 'three';
import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform sampler2D tAudioSpectrum;
uniform float uTime;
uniform float intensity;
uniform float bars;
uniform float mode; // 0 = overlay, 1 = replace
uniform float position; // 0 = bottom, 0.5 = center, 1 = top
uniform float colorMode; // 0 = rainbow, 1 = green, 2 = custom gradient

varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(tDiffuse, vUv);

    // Quantize X to create bars
    float barWidth = 1.0 / bars;
    float barIndex = floor(vUv.x / barWidth);
    float barX = barIndex * barWidth + barWidth * 0.5;

    // Sample the audio spectrum texture at this bar position
    float spectrumValue = texture2D(tAudioSpectrum, vec2(barX, 0.5)).r;
    float barHeight = spectrumValue * intensity;

    // Calculate bar position based on position param
    float inBar;

    if (position < 0.25) {
        // Bottom
        inBar = step(vUv.y, barHeight);
    } else if (position > 0.75) {
        // Top
        inBar = step(1.0 - barHeight, vUv.y);
    } else {
        // Center (mirrored)
        float halfHeight = barHeight * 0.5;
        inBar = step(0.5 - halfHeight, vUv.y) * step(vUv.y, 0.5 + halfHeight);
    }

    // Color based on mode
    vec3 barColor;
    if (colorMode < 0.5) {
        // Rainbow - HSL based on bar position
        float hue = barX;
        vec3 c = vec3(hue, 0.8, 0.5 + spectrumValue * 0.3);
        // HSL to RGB
        float h = c.x * 6.0;
        float s = c.y;
        float l = c.z;
        float chroma = (1.0 - abs(2.0 * l - 1.0)) * s;
        float x = chroma * (1.0 - abs(mod(h, 2.0) - 1.0));
        float m = l - chroma / 2.0;
        vec3 rgb;
        if (h < 1.0) rgb = vec3(chroma, x, 0.0);
        else if (h < 2.0) rgb = vec3(x, chroma, 0.0);
        else if (h < 3.0) rgb = vec3(0.0, chroma, x);
        else if (h < 4.0) rgb = vec3(0.0, x, chroma);
        else if (h < 5.0) rgb = vec3(x, 0.0, chroma);
        else rgb = vec3(chroma, 0.0, x);
        barColor = rgb + m;
    } else if (colorMode < 1.5) {
        // Classic green VU style
        float levelY = position < 0.25 ? vUv.y / barHeight :
                       position > 0.75 ? (1.0 - vUv.y) / barHeight :
                       abs(vUv.y - 0.5) / (barHeight * 0.5);
        levelY = clamp(levelY, 0.0, 1.0);

        if (levelY < 0.6) barColor = vec3(0.2, 1.0, 0.4);
        else if (levelY < 0.8) barColor = vec3(1.0, 0.8, 0.2);
        else barColor = vec3(1.0, 0.2, 0.2);
    } else {
        // Cyan gradient
        barColor = mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 1.0, 1.0), spectrumValue);
    }

    barColor *= inBar;

    // Add glow
    barColor *= (1.0 + spectrumValue * 0.5);

    if (mode < 0.5) {
        // Additive overlay
        gl_FragColor = vec4(texColor.rgb + barColor * 0.8, texColor.a);
    } else {
        // Replace (with slight transparency)
        gl_FragColor = vec4(mix(texColor.rgb, barColor, inBar * 0.9), 1.0);
    }
}
`;

export class AudioSpectrumEffect extends Effect {
    private spectrumTexture: THREE.DataTexture | null = null;

    constructor() {
        super('AudioSpectrum', fragmentShader, [
            { id: 'intensity', label: 'Intensity', type: 'float', min: 0, max: 2, defaultValue: 1.0 },
            { id: 'bars', label: 'Bar Count', type: 'float', min: 8, max: 128, defaultValue: 32, step: 1 },
            { id: 'position', label: 'Position', type: 'float', min: 0, max: 1, defaultValue: 0 },
            { id: 'colorMode', label: 'Color Mode', type: 'float', min: 0, max: 2, defaultValue: 0, step: 1 },
            { id: 'mode', label: 'Overlay/Replace', type: 'boolean', defaultValue: false },
        ]);

        // Create a placeholder spectrum texture
        const data = new Float32Array(512);
        this.spectrumTexture = new THREE.DataTexture(data, 512, 1, THREE.RedFormat, THREE.FloatType);
        this.spectrumTexture.needsUpdate = true;
        this.uniforms['tAudioSpectrum'] = { value: this.spectrumTexture };
    }

    /**
     * Update the spectrum texture with real audio data
     */
    setSpectrumTexture(texture: THREE.DataTexture | null): void {
        if (texture) {
            this.uniforms['tAudioSpectrum'].value = texture;
            this.spectrumTexture = texture;
        }
    }

    /**
     * Get the spectrum texture uniform for external binding
     */
    getSpectrumTextureUniform(): THREE.IUniform {
        return this.uniforms['tAudioSpectrum'];
    }
}
