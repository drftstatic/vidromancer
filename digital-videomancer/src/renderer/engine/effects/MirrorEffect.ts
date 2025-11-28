import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uAxis;      // 0 = horizontal, 1 = vertical
uniform float uPosition;  // Mirror position (0-1)
uniform float uSegments;  // Number of mirror segments
varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    // Determine which axis to mirror
    float coord = uAxis < 0.5 ? uv.x : uv.y;
    float otherCoord = uAxis < 0.5 ? uv.y : uv.x;

    // Calculate segment
    float segmentSize = 1.0 / max(1.0, uSegments);
    float segment = floor(coord / segmentSize);
    float localCoord = (coord - segment * segmentSize) / segmentSize;

    // Mirror alternate segments
    if (mod(segment, 2.0) >= 1.0) {
        localCoord = 1.0 - localCoord;
    }

    // Apply position offset for asymmetric mirror
    if (localCoord > uPosition) {
        localCoord = uPosition - (localCoord - uPosition);
    }

    localCoord = clamp(localCoord, 0.0, 1.0);
    coord = segment * segmentSize + localCoord * segmentSize;

    // Reconstruct UV
    if (uAxis < 0.5) {
        uv = vec2(coord, otherCoord);
    } else {
        uv = vec2(otherCoord, coord);
    }

    gl_FragColor = texture2D(tDiffuse, uv);
}
`;

export class MirrorEffect extends Effect {
    constructor() {
        super('Mirror', fragmentShader, [
            {
                id: 'uAxis',
                label: 'Axis',
                type: 'float',
                min: 0,
                max: 1,
                step: 1,
                defaultValue: 0,
            },
            {
                id: 'uPosition',
                label: 'Position',
                type: 'float',
                min: 0,
                max: 1,
                defaultValue: 0.5,
            },
            {
                id: 'uSegments',
                label: 'Segments',
                type: 'float',
                min: 1,
                max: 8,
                step: 1,
                defaultValue: 2,
            },
        ]);
    }
}
