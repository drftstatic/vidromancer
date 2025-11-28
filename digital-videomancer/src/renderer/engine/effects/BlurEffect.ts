import { Effect } from './Effect';
import * as THREE from 'three';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uRadius;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec4 color = vec4(0.0);
    vec2 off = vec2(uRadius) / uResolution;
    
    color += texture2D(tDiffuse, vUv + vec2(-off.x, -off.y));
    color += texture2D(tDiffuse, vUv + vec2(0.0, -off.y));
    color += texture2D(tDiffuse, vUv + vec2(off.x, -off.y));
    
    color += texture2D(tDiffuse, vUv + vec2(-off.x, 0.0));
    color += texture2D(tDiffuse, vUv);
    color += texture2D(tDiffuse, vUv + vec2(off.x, 0.0));
    
    color += texture2D(tDiffuse, vUv + vec2(-off.x, off.y));
    color += texture2D(tDiffuse, vUv + vec2(0.0, off.y));
    color += texture2D(tDiffuse, vUv + vec2(off.x, off.y));
    
    gl_FragColor = color / 9.0;
}
`;

export class BlurEffect extends Effect {
    constructor() {
        super('Blur', fragmentShader, [
            {
                id: 'uRadius',
                label: 'Radius',
                type: 'float',
                min: 0,
                max: 10,
                defaultValue: 0,
            },
        ]);
        this.uniforms.uResolution = { value: new THREE.Vector2(1280, 720) };
    }
}
