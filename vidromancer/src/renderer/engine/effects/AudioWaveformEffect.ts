import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float amplitude;
uniform float thickness;
uniform vec3 color;
uniform float mode; // 0 = overlay, 1 = replace

varying vec2 vUv;

// We'll use a simple sine wave simulation for now since we can't easily pass the raw array 
// to the shader without a texture. But wait! We can pass the audio data as a texture or uniform array.
// For this MVP, let's assume we are modulating the "amplitude" parameter with the AudioReactiveManager
// and drawing a synthesized wave, OR we can try to pass a data texture.
// 
// Actually, for a true waveform effect, we need the data.
// Let's create a "data texture" approach in the future.
// For now, let's make a "Oscilloscope" style effect that uses the audio volume to modulate a wave.

void main() {
    vec4 texColor = texture2D(tDiffuse, vUv);
    
    // Center line
    float y = 0.5;
    
    // Create a wave
    // We use uTime for phase, and we want the amplitude to be reactive
    float wave = sin(vUv.x * 20.0 + uTime * 5.0) * amplitude * 0.5;
    
    // Distance from wave
    float dist = abs(vUv.y - (y + wave));
    
    // Draw line
    float line = 1.0 - smoothstep(thickness - 0.01, thickness, dist);
    
    vec3 waveColor = color * line;
    
    if (mode < 0.5) {
        // Overlay
        gl_FragColor = vec4(max(texColor.rgb, waveColor), texColor.a);
    } else {
        // Replace (black background)
        gl_FragColor = vec4(mix(texColor.rgb, waveColor, line), 1.0);
    }
}
`;

export class AudioWaveformEffect extends Effect {
    constructor() {
        super('AudioWaveform', fragmentShader, [
            { id: 'amplitude', label: 'Amplitude', type: 'float', min: 0, max: 1, defaultValue: 0.5 },
            { id: 'thickness', label: 'Thickness', type: 'float', min: 0.001, max: 0.1, defaultValue: 0.02 },
            // Color would ideally be a color picker, but we only have float/bool. 
            // We'll hardcode white for now or maybe add color params later if needed.
            // Actually, let's just use a float for "Hue" if we implement HSL in shader, 
            // but for now let's keep it simple: White wave.
            { id: 'mode', label: 'Overlay/Replace', type: 'boolean', defaultValue: false }, // false = overlay
        ]);

        // Inject color uniform manually since we don't have a color param type yet
        this.uniforms['color'] = { value: [1, 1, 1] };
    }
}
