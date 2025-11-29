import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float intensity;
uniform float bars;
uniform float mode; // 0 = overlay, 1 = replace

varying vec2 vUv;

// Simulating spectrum bars
// In a real implementation we'd pass a 1D texture of FFT data.
// Here we'll simulate it using noise and the "intensity" parameter which should be mapped to Audio Volume or specific bands.

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec4 texColor = texture2D(tDiffuse, vUv);
    
    // Quantize X to create bars
    float barWidth = 1.0 / bars;
    float barX = floor(vUv.x / barWidth) * barWidth;
    
    // Generate a random height for each bar, modulated by intensity
    // We add uTime to make it animate slightly even if static, but mostly driven by intensity
    float noise = rand(vec2(barX, floor(uTime * 10.0))); 
    float barHeight = noise * intensity;
    
    // Draw bar
    float bar = step(vUv.y, barHeight);
    
    vec3 barColor = vec3(vUv.x, 1.0 - vUv.x, 0.5) * bar; // Gradient color
    
    if (mode < 0.5) {
        // Overlay
        gl_FragColor = vec4(max(texColor.rgb, barColor), texColor.a);
    } else {
        // Replace
        gl_FragColor = vec4(mix(texColor.rgb, barColor, bar), 1.0);
    }
}
`;

export class AudioSpectrumEffect extends Effect {
    constructor() {
        super('AudioSpectrum', fragmentShader, [
            { id: 'intensity', label: 'Intensity', type: 'float', min: 0, max: 1, defaultValue: 0.5 },
            { id: 'bars', label: 'Bar Count', type: 'float', min: 10, max: 100, defaultValue: 32, step: 1 },
            { id: 'mode', label: 'Overlay/Replace', type: 'boolean', defaultValue: false },
        ]);
    }
}
