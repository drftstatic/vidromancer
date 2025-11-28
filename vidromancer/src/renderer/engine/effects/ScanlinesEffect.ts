import { Effect } from './Effect';
import * as THREE from 'three';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uCount;
uniform float uIntensity;
uniform float uTime;
uniform float uSpeed;
uniform float uThickness;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    // Calculate scanline position
    float y = vUv.y * uResolution.y;
    float scanlineOffset = uTime * uSpeed * 100.0;

    // Create scanline pattern
    float scanline = sin((y + scanlineOffset) * 3.14159 * uCount / uResolution.y);
    scanline = smoothstep(0.0, uThickness, scanline);

    // Apply intensity
    float darkness = mix(1.0, scanline, uIntensity);

    // Optional: add slight color fringing on scanlines
    vec3 result = color.rgb * darkness;

    gl_FragColor = vec4(result, color.a);
}
`;

export class ScanlinesEffect extends Effect {
    constructor() {
        super('Scanlines', fragmentShader, [
            {
                id: 'uCount',
                label: 'Count',
                type: 'float',
                min: 50,
                max: 500,
                step: 10,
                defaultValue: 200,
            },
            {
                id: 'uIntensity',
                label: 'Intensity',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.3,
            },
            {
                id: 'uThickness',
                label: 'Thickness',
                type: 'float',
                min: 0.1,
                max: 1,
                defaultValue: 0.5,
            },
            {
                id: 'uSpeed',
                label: 'Scroll Speed',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0,
            },
        ]);
        this.uniforms.uResolution = { value: new THREE.Vector2(1280, 720) };
    }
}
