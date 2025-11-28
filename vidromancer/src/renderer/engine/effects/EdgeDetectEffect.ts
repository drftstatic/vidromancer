import { Effect } from './Effect';
import * as THREE from 'three';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uStrength;
uniform float uThreshold;
uniform float uColorize;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec2 texel = vec2(1.0) / uResolution;

    // Sample surrounding pixels for Sobel operator
    float tl = dot(texture2D(tDiffuse, vUv + texel * vec2(-1, -1)).rgb, vec3(0.299, 0.587, 0.114));
    float t  = dot(texture2D(tDiffuse, vUv + texel * vec2( 0, -1)).rgb, vec3(0.299, 0.587, 0.114));
    float tr = dot(texture2D(tDiffuse, vUv + texel * vec2( 1, -1)).rgb, vec3(0.299, 0.587, 0.114));
    float l  = dot(texture2D(tDiffuse, vUv + texel * vec2(-1,  0)).rgb, vec3(0.299, 0.587, 0.114));
    float r  = dot(texture2D(tDiffuse, vUv + texel * vec2( 1,  0)).rgb, vec3(0.299, 0.587, 0.114));
    float bl = dot(texture2D(tDiffuse, vUv + texel * vec2(-1,  1)).rgb, vec3(0.299, 0.587, 0.114));
    float b  = dot(texture2D(tDiffuse, vUv + texel * vec2( 0,  1)).rgb, vec3(0.299, 0.587, 0.114));
    float br = dot(texture2D(tDiffuse, vUv + texel * vec2( 1,  1)).rgb, vec3(0.299, 0.587, 0.114));

    // Sobel operators
    float gx = (tl + 2.0 * l + bl) - (tr + 2.0 * r + br);
    float gy = (tl + 2.0 * t + tr) - (bl + 2.0 * b + br);

    // Edge magnitude
    float edge = sqrt(gx * gx + gy * gy) * uStrength;

    // Apply threshold
    edge = smoothstep(uThreshold, uThreshold + 0.1, edge);

    // Original color
    vec4 original = texture2D(tDiffuse, vUv);

    // Colorize option: edge tinted by original color or white
    vec3 edgeColor = mix(vec3(edge), original.rgb * edge, uColorize);

    gl_FragColor = vec4(edgeColor, original.a);
}
`;

export class EdgeDetectEffect extends Effect {
    constructor() {
        super('Edge Detect', fragmentShader, [
            {
                id: 'uStrength',
                label: 'Strength',
                type: 'float',
                min: 0,
                max: 5,
                defaultValue: 1,
            },
            {
                id: 'uThreshold',
                label: 'Threshold',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.1,
            },
            {
                id: 'uColorize',
                label: 'Colorize',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0,
            },
        ]);
        this.uniforms.uResolution = { value: new THREE.Vector2(1280, 720) };
    }
}
