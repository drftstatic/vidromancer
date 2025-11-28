import { Effect } from './Effect';

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uSegments;
uniform float uRotation;
uniform float uZoom;
uniform float uOffsetX;
uniform float uOffsetY;
varying vec2 vUv;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

void main() {
    // Center and offset
    vec2 uv = vUv - 0.5;
    uv += vec2(uOffsetX, uOffsetY) * 0.5;

    // Apply zoom
    uv *= 1.0 + uZoom;

    // Convert to polar coordinates
    float r = length(uv);
    float a = atan(uv.y, uv.x) + uRotation;

    // Kaleidoscope effect
    float segments = max(1.0, floor(uSegments));
    float segmentAngle = TWO_PI / segments;

    // Find which segment we're in and mirror alternating segments
    float segmentIndex = floor(a / segmentAngle);
    float localAngle = mod(a, segmentAngle);

    // Mirror every other segment
    if (mod(segmentIndex, 2.0) >= 1.0) {
        localAngle = segmentAngle - localAngle;
    }

    // Keep angle in first segment
    a = localAngle;

    // Convert back to cartesian
    uv = vec2(cos(a), sin(a)) * r;

    // Center back
    uv += 0.5;

    // Clamp to valid UV range
    uv = clamp(uv, 0.0, 1.0);

    gl_FragColor = texture2D(tDiffuse, uv);
}
`;

export class KaleidoscopeEffect extends Effect {
    constructor() {
        super('Kaleidoscope', fragmentShader, [
            {
                id: 'uSegments',
                label: 'Segments',
                type: 'float',
                min: 2,
                max: 16,
                step: 1,
                defaultValue: 6,
            },
            {
                id: 'uRotation',
                label: 'Rotation',
                type: 'float',
                min: 0,
                max: 6.28,
                defaultValue: 0,
            },
            {
                id: 'uZoom',
                label: 'Zoom',
                type: 'float',
                min: -0.9,
                max: 2,
                defaultValue: 0,
            },
            {
                id: 'uOffsetX',
                label: 'Offset X',
                type: 'float',
                min: -1,
                max: 1,
                defaultValue: 0,
            },
            {
                id: 'uOffsetY',
                label: 'Offset Y',
                type: 'float',
                min: -1,
                max: 1,
                defaultValue: 0,
            },
        ]);
    }
}
