import * as THREE from 'three';
import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform sampler2D tAudioWaveform;
uniform float uTime;
uniform float amplitude;
uniform float thickness;
uniform float hue;
uniform float glow;
uniform float mode; // 0 = overlay, 1 = replace

varying vec2 vUv;

// HSL to RGB conversion
vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c / 2.0;
    vec3 rgb;
    if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
    else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
    else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
    else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
    else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);
    return rgb + m;
}

void main() {
    vec4 texColor = texture2D(tDiffuse, vUv);

    // Sample waveform data at this X position
    float waveformValue = texture2D(tAudioWaveform, vec2(vUv.x, 0.5)).r;

    // Center line at 0.5, waveform goes above and below
    float y = 0.5 + waveformValue * amplitude * 0.5;

    // Distance from waveform line
    float dist = abs(vUv.y - y);

    // Draw line with smooth edges
    float line = 1.0 - smoothstep(thickness * 0.5, thickness, dist);

    // Color based on hue parameter
    vec3 waveColor = hsl2rgb(hue, 0.9, 0.6);

    // Apply glow effect
    float glowFactor = exp(-dist * 20.0 / glow) * glow * 0.5;
    vec3 glowColor = waveColor * glowFactor;

    vec3 finalWaveColor = waveColor * line + glowColor;

    if (mode < 0.5) {
        // Additive overlay
        gl_FragColor = vec4(texColor.rgb + finalWaveColor, texColor.a);
    } else {
        // Replace
        float alpha = max(line, glowFactor * 0.5);
        gl_FragColor = vec4(mix(texColor.rgb, finalWaveColor, alpha), 1.0);
    }
}
`;

export class AudioWaveformEffect extends Effect {
    private waveformTexture: THREE.DataTexture | null = null;

    constructor() {
        super('AudioWaveform', fragmentShader, [
            { id: 'amplitude', label: 'Amplitude', type: 'float', min: 0, max: 2, defaultValue: 1.0 },
            { id: 'thickness', label: 'Thickness', type: 'float', min: 0.002, max: 0.05, defaultValue: 0.01 },
            { id: 'hue', label: 'Hue', type: 'float', min: 0, max: 1, defaultValue: 0.5 },
            { id: 'glow', label: 'Glow', type: 'float', min: 0, max: 2, defaultValue: 0.5 },
            { id: 'mode', label: 'Overlay/Replace', type: 'boolean', defaultValue: false },
        ]);

        // Create a placeholder waveform texture
        const data = new Float32Array(512);
        this.waveformTexture = new THREE.DataTexture(data, 512, 1, THREE.RedFormat, THREE.FloatType);
        this.waveformTexture.needsUpdate = true;
        this.uniforms['tAudioWaveform'] = { value: this.waveformTexture };
    }

    /**
     * Update the waveform texture with real audio data
     */
    setWaveformTexture(texture: THREE.DataTexture | null): void {
        if (texture) {
            this.uniforms['tAudioWaveform'].value = texture;
            this.waveformTexture = texture;
        }
    }

    /**
     * Get the waveform texture uniform for external binding
     */
    getWaveformTextureUniform(): THREE.IUniform {
        return this.uniforms['tAudioWaveform'];
    }
}
