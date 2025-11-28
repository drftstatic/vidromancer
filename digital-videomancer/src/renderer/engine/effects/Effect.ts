import * as THREE from 'three';

export interface EffectParameter {
    id: string;
    label: string;
    type: 'float' | 'color' | 'boolean';
    min?: number;
    max?: number;
    step?: number;
    defaultValue: number | string | boolean;
}

export abstract class Effect {
    public id: string;
    public name: string;
    public uniforms: { [uniform: string]: THREE.IUniform };
    public parameters: EffectParameter[];
    public fragmentShader: string;
    public vertexShader: string;

    constructor(name: string, fragmentShader: string, parameters: EffectParameter[] = []) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.parameters = parameters;
        this.fragmentShader = fragmentShader;
        this.vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

        this.uniforms = {
            tDiffuse: { value: null },
            uTime: { value: 0 },
        };

        // Initialize uniforms from parameters
        parameters.forEach(param => {
            this.uniforms[param.id] = { value: param.defaultValue };
        });

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });
    }

    public material: THREE.ShaderMaterial;

    setParameter(id: string, value: number | string | boolean) {
        if (this.uniforms[id]) {
            this.uniforms[id].value = value;
        }
    }

    update(time: number) {
        this.uniforms.uTime.value = time;
    }
}
