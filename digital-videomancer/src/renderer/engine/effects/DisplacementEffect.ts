import { Effect } from './Effect';
import * as THREE from 'three';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uAmount;
uniform float uDirection;
uniform float uChannel;
uniform vec2 uResolution;
varying vec2 vUv;

#define PI 3.14159265359

void main() {
    // Sample original color to get displacement value
    vec4 original = texture2D(tDiffuse, vUv);

    // Select channel for displacement (0=R, 0.33=G, 0.66=B, 1=Luminance)
    float displacement;
    if (uChannel < 0.25) {
        displacement = original.r;
    } else if (uChannel < 0.5) {
        displacement = original.g;
    } else if (uChannel < 0.75) {
        displacement = original.b;
    } else {
        displacement = dot(original.rgb, vec3(0.299, 0.587, 0.114));
    }

    // Center displacement around 0
    displacement = displacement - 0.5;

    // Calculate displacement direction
    float angle = uDirection * PI * 2.0;
    vec2 dir = vec2(cos(angle), sin(angle));

    // Apply displacement
    vec2 offset = dir * displacement * uAmount * 0.1;
    vec2 displacedUV = vUv + offset;

    // Clamp to valid range
    displacedUV = clamp(displacedUV, 0.0, 1.0);

    gl_FragColor = texture2D(tDiffuse, displacedUV);
}
`;

export class DisplacementEffect extends Effect {
    constructor() {
        super('Displacement', fragmentShader, [
            {
                id: 'uAmount',
                label: 'Amount',
                type: 'float',
                min: 0,
                max: 5,
                defaultValue: 1,
            },
            {
                id: 'uDirection',
                label: 'Direction',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0,
            },
            {
                id: 'uChannel',
                label: 'Channel',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 1,
            },
        ]);
        this.uniforms.uResolution = { value: new THREE.Vector2(1280, 720) };
    }
}
