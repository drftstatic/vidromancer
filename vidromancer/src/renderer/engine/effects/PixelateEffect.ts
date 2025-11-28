import { Effect } from './Effect';
import * as THREE from 'three';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uSize;
uniform float uShape;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
    vec2 resolution = uResolution;
    float pixelSize = max(1.0, uSize);

    // Calculate pixel grid
    vec2 pixelCount = resolution / pixelSize;
    vec2 pixelUV = floor(vUv * pixelCount) / pixelCount;

    // Add half pixel offset to sample center
    pixelUV += (0.5 / pixelCount);

    // Hexagonal grid option (shape > 0.5)
    if (uShape > 0.5) {
        vec2 hexSize = vec2(pixelSize * 1.732, pixelSize * 2.0);
        vec2 pos = vUv * resolution;

        // Offset every other row
        float row = floor(pos.y / hexSize.y);
        float offset = mod(row, 2.0) * hexSize.x * 0.5;

        vec2 hexPos = vec2(pos.x - offset, pos.y);
        vec2 hexCoord = floor(hexPos / hexSize);

        // Calculate hex center
        vec2 hexCenter = hexCoord * hexSize + hexSize * 0.5;
        hexCenter.x += offset;

        pixelUV = hexCenter / resolution;
    }

    // Clamp UV
    pixelUV = clamp(pixelUV, 0.0, 1.0);

    gl_FragColor = texture2D(tDiffuse, pixelUV);
}
`;

export class PixelateEffect extends Effect {
    constructor() {
        super('Pixelate', fragmentShader, [
            {
                id: 'uSize',
                label: 'Size',
                type: 'float',
                min: 1,
                max: 64,
                step: 1,
                defaultValue: 8,
            },
            {
                id: 'uShape',
                label: 'Hex Shape',
                type: 'float',
                min: 0,
                max: 1,
                step: 1,
                defaultValue: 0,
            },
        ]);
        this.uniforms.uResolution = { value: new THREE.Vector2(1280, 720) };
    }
}
