import { Effect } from './Effect';
import * as THREE from 'three';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uTracking;
uniform float uNoise;
uniform float uColorBleed;
uniform float uDistortion;
uniform vec2 uResolution;
varying vec2 vUv;

// Pseudo-random noise function
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;

    // Tracking distortion - horizontal offset that varies over time and position
    float trackingOffset = sin(uv.y * 50.0 + uTime * 5.0) * uTracking * 0.01;
    trackingOffset += sin(uv.y * 200.0 + uTime * 20.0) * uTracking * 0.005;

    // Occasional larger tracking glitches
    float glitchLine = step(0.995, rand(vec2(floor(uTime * 10.0), floor(uv.y * 20.0))));
    trackingOffset += glitchLine * uTracking * 0.1 * (rand(vec2(uTime)) - 0.5);

    uv.x += trackingOffset;

    // Wave distortion
    uv.x += sin(uv.y * 10.0 + uTime * 2.0) * uDistortion * 0.01;
    uv.y += sin(uv.x * 10.0 + uTime * 2.0) * uDistortion * 0.005;

    // Color bleed - shift color channels horizontally
    float bleedOffset = uColorBleed * 0.01;
    float r = texture2D(tDiffuse, vec2(uv.x + bleedOffset, uv.y)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, vec2(uv.x - bleedOffset, uv.y)).b;

    vec3 color = vec3(r, g, b);

    // Add noise
    float noise = rand(uv + fract(uTime)) * uNoise;
    color += noise - uNoise * 0.5;

    // Scanlines
    float scanline = sin(uv.y * uResolution.y * 3.14159) * 0.04;
    color -= scanline;

    // Vignette
    vec2 vignetteUV = uv * (1.0 - uv.yx);
    float vignette = vignetteUV.x * vignetteUV.y * 15.0;
    vignette = pow(vignette, 0.25);
    color *= vignette;

    // Slight color reduction for that analog feel
    color = floor(color * 32.0) / 32.0;

    gl_FragColor = vec4(color, 1.0);
}
`;

export class VHSEffect extends Effect {
    constructor() {
        super('VHS', fragmentShader, [
            {
                id: 'uTracking',
                label: 'Tracking',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.3,
            },
            {
                id: 'uNoise',
                label: 'Noise',
                type: 'float',
                min: 0,
                max: 0.5,
                defaultValue: 0.1,
            },
            {
                id: 'uColorBleed',
                label: 'Color Bleed',
                type: 'float',
                min: 0,
                max: 2,
                defaultValue: 0.5,
            },
            {
                id: 'uDistortion',
                label: 'Distortion',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.2,
            },
        ]);
        this.uniforms.uResolution = { value: new THREE.Vector2(1280, 720) };
    }
}
