import { Effect } from './Effect';

/**
 * AudioGlowEffect - Adds a pulsing glow/vignette effect driven by audio levels
 *
 * This effect creates visual feedback from audio:
 * - Edge glow that pulses with bass
 * - Color shift based on frequency bands
 * - Brightness modulation
 */
const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float bass;
uniform float mid;
uniform float treble;
uniform float volume;
uniform float intensity;
uniform float glowSize;
uniform float hue;
uniform float saturation;
uniform float colorReactive; // 0 = fixed color, 1 = frequency reactive

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

    // Distance from edge (vignette factor)
    vec2 center = vUv - 0.5;
    float dist = length(center);

    // Edge distance (0 at center, 1 at corners)
    float edgeDist = smoothstep(0.0, 0.7, dist);

    // Calculate glow intensity based on audio
    float audioIntensity = (bass * 0.5 + mid * 0.3 + treble * 0.2) * intensity;
    float pulseGlow = audioIntensity * edgeDist * glowSize;

    // Calculate glow color
    vec3 glowColor;
    if (colorReactive > 0.5) {
        // Frequency-reactive color
        // Bass = red/orange, Mid = green/cyan, Treble = blue/magenta
        float reactiveHue = bass * 0.05 + mid * 0.35 + treble * 0.75;
        reactiveHue = mod(reactiveHue + hue, 1.0);
        glowColor = hsl2rgb(reactiveHue, saturation, 0.5 + volume * 0.3);
    } else {
        // Fixed color with intensity modulation
        glowColor = hsl2rgb(hue, saturation, 0.5 + audioIntensity * 0.3);
    }

    // Apply glow to edges
    vec3 result = texColor.rgb;

    // Add edge glow (additive)
    result += glowColor * pulseGlow;

    // Add subtle brightness boost based on volume
    float brightnessBoost = 1.0 + volume * intensity * 0.2;
    result *= brightnessBoost;

    // Add subtle color tint to whole image based on bass
    vec3 bassColor = hsl2rgb(hue, saturation * 0.5, 0.5);
    result = mix(result, result * (1.0 + bassColor * bass * intensity * 0.3), bass * intensity * 0.5);

    gl_FragColor = vec4(clamp(result, 0.0, 1.0), texColor.a);
}
`;

export class AudioGlowEffect extends Effect {
    constructor() {
        super('AudioGlow', fragmentShader, [
            { id: 'intensity', label: 'Intensity', type: 'float', min: 0, max: 2, defaultValue: 1.0 },
            { id: 'glowSize', label: 'Glow Size', type: 'float', min: 0, max: 3, defaultValue: 1.5 },
            { id: 'hue', label: 'Hue', type: 'float', min: 0, max: 1, defaultValue: 0.0 },
            { id: 'saturation', label: 'Saturation', type: 'float', min: 0, max: 1, defaultValue: 0.8 },
            { id: 'colorReactive', label: 'Color Reactive', type: 'boolean', defaultValue: true },
        ]);

        // Add audio-driven uniforms (will be updated by AudioReactiveManager)
        this.uniforms['bass'] = { value: 0 };
        this.uniforms['mid'] = { value: 0 };
        this.uniforms['treble'] = { value: 0 };
        this.uniforms['volume'] = { value: 0 };
    }

    /**
     * Update audio levels directly (alternative to AudioReactiveManager)
     */
    setAudioLevels(bass: number, mid: number, treble: number, volume: number): void {
        this.uniforms['bass'].value = bass;
        this.uniforms['mid'].value = mid;
        this.uniforms['treble'].value = treble;
        this.uniforms['volume'].value = volume;
    }
}
