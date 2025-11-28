import { Effect } from './Effect';
import * as THREE from 'three';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform sampler2D tFeedback;
uniform float uAmount;
uniform float uDecay;
uniform float uZoom;
uniform float uRotation;
uniform vec2 uOffset;
varying vec2 vUv;

void main() {
    // Current frame
    vec4 current = texture2D(tDiffuse, vUv);

    // Transform UV for feedback sampling
    vec2 center = vec2(0.5);
    vec2 uv = vUv - center;

    // Apply zoom
    uv *= 1.0 / (1.0 + uZoom * 0.1);

    // Apply rotation
    float s = sin(uRotation * 0.1);
    float c = cos(uRotation * 0.1);
    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

    // Apply offset
    uv += uOffset * 0.1;

    uv += center;

    // Sample feedback with decay
    vec4 feedback = vec4(0.0);
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
        feedback = texture2D(tFeedback, uv) * uDecay;
    }

    // Mix current with feedback
    gl_FragColor = mix(current, max(current, feedback), uAmount);
}
`;

export class FeedbackEffect extends Effect {
    public feedbackTexture: THREE.WebGLRenderTarget | null = null;
    public needsFeedback: boolean = true;

    constructor() {
        super('Feedback', fragmentShader, [
            {
                id: 'uAmount',
                label: 'Amount',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.5,
            },
            {
                id: 'uDecay',
                label: 'Decay',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.95,
            },
            {
                id: 'uZoom',
                label: 'Zoom',
                type: 'float',
                min: -1,
                max: 1,
                defaultValue: 0,
            },
            {
                id: 'uRotation',
                label: 'Rotation',
                type: 'float',
                min: -1,
                max: 1,
                defaultValue: 0,
            },
        ]);

        this.uniforms.tFeedback = { value: null };
        this.uniforms.uOffset = { value: new THREE.Vector2(0, 0) };
    }

    setFeedbackTexture(texture: THREE.Texture | null) {
        this.uniforms.tFeedback.value = texture;
    }
}
