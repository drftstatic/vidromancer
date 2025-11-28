import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uCycle;
varying vec2 vUv;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    
    float hue = fract(lum + uCycle);
    vec3 rgb = hsv2rgb(vec3(hue, 1.0, 1.0));
    
    gl_FragColor = vec4(rgb, color.a);
}
`;

export class ColoramaEffect extends Effect {
    constructor() {
        super('Colorama', fragmentShader, [
            {
                id: 'uCycle',
                label: 'Cycle',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0,
            },
        ]);
    }
}
