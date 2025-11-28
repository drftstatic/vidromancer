import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uAmount;
varying vec2 vUv;

void main() {
    vec2 offset = vec2(uAmount * 0.05, 0.0);
    float r = texture2D(tDiffuse, vUv + offset).r;
    float g = texture2D(tDiffuse, vUv).g;
    float b = texture2D(tDiffuse, vUv - offset).b;
    gl_FragColor = vec4(r, g, b, 1.0);
}
`;

export class GlitchEffect extends Effect {
    constructor() {
        super('Glitch', fragmentShader, [
            {
                id: 'uAmount',
                label: 'Amount',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0,
            },
        ]);
    }
}
