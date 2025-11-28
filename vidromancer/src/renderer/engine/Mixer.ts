import * as THREE from 'three';

export type BlendMode = 'normal' | 'add' | 'multiply' | 'screen' | 'overlay' | 'difference';

export class Mixer {
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
    renderTarget: THREE.WebGLRenderTarget;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.renderTarget = new THREE.WebGLRenderTarget(1280, 720); // Default resolution

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                textureA: { value: null },
                textureB: { value: null },
                mixRatio: { value: 0.0 },
                blendMode: { value: 0 } // 0: Normal, 1: Add, 2: Mult, 3: Screen, 4: Overlay, 5: Diff
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D textureA;
                uniform sampler2D textureB;
                uniform float mixRatio;
                uniform int blendMode;
                varying vec2 vUv;

                vec3 blend(vec3 a, vec3 b, int mode) {
                    if (mode == 1) return a + b;
                    if (mode == 2) return a * b;
                    if (mode == 3) return 1.0 - (1.0 - a) * (1.0 - b);
                    if (mode == 4) return a.r < 0.5 ? (2.0 * a * b) : (1.0 - 2.0 * (1.0 - a) * (1.0 - b)); // Simple overlay approx
                    if (mode == 5) return abs(a - b);
                    return mix(a, b, mixRatio); // Normal mix handled outside for modes 1-5? No, usually mix happens after blend?
                    // Actually, standard mixer is: Result = Mix(A, Blend(A, B), Ratio) or just Mix(A, B, Ratio) for Normal.
                    // Let's simplify: We are crossfading between A and B. 
                    // But "Blend Mode" usually applies to how B is composited onto A.
                    // In a DJ style mixer, it's usually just A <-> B crossfade.
                    // Let's implement standard Crossfade for Normal, and Layered Blends for others.
                }

                void main() {
                    vec4 colorA = texture2D(textureA, vUv);
                    vec4 colorB = texture2D(textureB, vUv);
                    
                    vec3 result = colorA.rgb;

                    if (blendMode == 0) {
                        // Normal Crossfade
                        result = mix(colorA.rgb, colorB.rgb, mixRatio);
                    } else {
                        // For other modes, we treat mixRatio as opacity of B over A
                        vec3 blended = vec3(0.0);
                        if (blendMode == 1) blended = colorA.rgb + colorB.rgb;
                        else if (blendMode == 2) blended = colorA.rgb * colorB.rgb;
                        else if (blendMode == 3) blended = 1.0 - (1.0 - colorA.rgb) * (1.0 - colorB.rgb);
                        else if (blendMode == 4) {
                            // Overlay
                            vec3 lum = vec3(0.2126, 0.7152, 0.0722);
                            float L = dot(colorA.rgb, lum);
                            if(L < 0.5) blended = 2.0 * colorA.rgb * colorB.rgb;
                            else blended = 1.0 - 2.0 * (1.0 - colorA.rgb) * (1.0 - colorB.rgb);
                        }
                        else if (blendMode == 5) blended = abs(colorA.rgb - colorB.rgb);
                        
                        result = mix(colorA.rgb, blended, mixRatio);
                    }

                    gl_FragColor = vec4(result, 1.0);
                }
            `
        });

        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.scene.add(this.mesh);
    }

    render(renderer: THREE.WebGLRenderer, textureA: THREE.Texture, textureB: THREE.Texture) {
        this.material.uniforms.textureA.value = textureA;
        this.material.uniforms.textureB.value = textureB;
        renderer.setRenderTarget(this.renderTarget);
        renderer.render(this.scene, this.camera);
        renderer.setRenderTarget(null);
        return this.renderTarget.texture;
    }

    setMixRatio(value: number) {
        this.material.uniforms.mixRatio.value = value;
    }

    setBlendMode(mode: BlendMode) {
        const map: Record<BlendMode, number> = {
            'normal': 0, 'add': 1, 'multiply': 2, 'screen': 3, 'overlay': 4, 'difference': 5
        };
        this.material.uniforms.blendMode.value = map[mode];
    }

    setSize(width: number, height: number) {
        this.renderTarget.setSize(width, height);
    }
}
