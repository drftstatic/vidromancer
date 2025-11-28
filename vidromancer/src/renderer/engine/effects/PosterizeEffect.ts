import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uLevels;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    // Posterize by reducing color levels
    float levels = max(2.0, floor(uLevels));
    vec3 posterized = floor(color.rgb * levels) / (levels - 1.0);

    gl_FragColor = vec4(posterized, color.a);
}
`;

export class PosterizeEffect extends Effect {
    constructor() {
        super('Posterize', fragmentShader, [
            {
                id: 'uLevels',
                label: 'Levels',
                type: 'float',
                min: 2,
                max: 32,
                step: 1,
                defaultValue: 4,
            },
        ]);
    }
}
