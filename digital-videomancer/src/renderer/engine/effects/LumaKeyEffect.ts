import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uThreshold;
uniform float uSoftness;
uniform float uInvert;
uniform float uKeyLow;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    // Calculate luminance
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));

    // Create key based on threshold and softness
    float key;
    if (uKeyLow > 0.5) {
        // Key out dark values
        key = smoothstep(uThreshold - uSoftness, uThreshold + uSoftness, luma);
    } else {
        // Key out bright values
        key = 1.0 - smoothstep(uThreshold - uSoftness, uThreshold + uSoftness, luma);
    }

    // Invert option
    if (uInvert > 0.5) {
        key = 1.0 - key;
    }

    // Apply key to alpha
    gl_FragColor = vec4(color.rgb, color.a * key);
}
`;

export class LumaKeyEffect extends Effect {
    constructor() {
        super('Luma Key', fragmentShader, [
            {
                id: 'uThreshold',
                label: 'Threshold',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.5,
            },
            {
                id: 'uSoftness',
                label: 'Softness',
                type: 'float',
                min: 0,
                max: 0.5,
                defaultValue: 0.1,
            },
            {
                id: 'uKeyLow',
                label: 'Key Darks',
                type: 'float',
                min: 0,
                max: 1,
                step: 1,
                defaultValue: 1,
            },
            {
                id: 'uInvert',
                label: 'Invert',
                type: 'float',
                min: 0,
                max: 1,
                step: 1,
                defaultValue: 0,
            },
        ]);
    }
}
