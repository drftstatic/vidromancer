import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uAmount;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    // Invert colors
    vec3 inverted = 1.0 - color.rgb;

    // Mix original with inverted
    vec3 result = mix(color.rgb, inverted, uAmount);

    gl_FragColor = vec4(result, color.a);
}
`;

export class InvertEffect extends Effect {
    constructor() {
        super('Invert', fragmentShader, [
            {
                id: 'uAmount',
                label: 'Amount',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 1,
            },
        ]);
    }
}
