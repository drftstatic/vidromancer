# Digital Videomancer - Development Plan

## Overview

This plan covers the implementation of 5 feature areas for the Digital Videomancer video effects application. UI/UX Polish will be handled separately using Google Stitch.

**Priority Order:**
1. More Effects (foundation - expands creative capabilities)
2. LFOs/Modulation System (enhances all effects automatically)
3. MIDI Integration Enhancement (already has basic CC learning, needs polish)
4. Recording/Output (capture and share output)
5. Multiple Inputs (advanced mixing capabilities)

---

## Phase 1: More Effects

### New Effects to Implement

| Effect | Description | Parameters |
|--------|-------------|------------|
| **Feedback** | Re-inject previous frame with decay | `amount`, `zoom`, `rotation`, `decay` |
| **LumaKey** | Key out luminance range | `threshold`, `softness`, `invert` |
| **ChromaKey** | Key out color range | `keyColor`, `threshold`, `softness` |
| **Pixelate** | Reduce resolution for pixel art look | `size`, `shape` (square/hex) |
| **Mirror** | Mirror/flip sections of frame | `axis`, `position`, `segments` |
| **Kaleidoscope** | Radial mirror segments | `segments`, `rotation`, `zoom` |
| **EdgeDetect** | Sobel edge detection | `strength`, `threshold`, `colorize` |
| **Invert** | Simple color inversion | `amount` (mix with original) |
| **Posterize** | Reduce color levels | `levels` |
| **Scanlines** | CRT-style scanlines | `count`, `intensity`, `offset` |
| **VHS** | VHS tape distortion | `tracking`, `noise`, `colorBleed` |
| **Displacement** | Displace pixels by luminance | `amount`, `direction` |

### Implementation Pattern
```typescript
// Each effect follows this pattern:
export class NewEffect extends Effect {
    constructor() {
        super('EffectName', fragmentShader, [
            { id: 'param1', label: 'Param 1', type: 'float', min: 0, max: 1, defaultValue: 0 },
        ]);
    }
}
```

### Effect Registry System
Create a central registry for dynamic effect discovery:
```typescript
// src/renderer/engine/effects/index.ts
export const effectRegistry = {
    Blur: BlurEffect,
    Glitch: GlitchEffect,
    // ... all effects
};
```

---

## Phase 2: LFO/Modulation System

### Architecture

```
LFOManager
├── LFO[] - Array of oscillators
│   ├── waveform: 'sine' | 'square' | 'saw' | 'triangle' | 'random'
│   ├── frequency: number (Hz)
│   ├── amplitude: number (0-1)
│   ├── offset: number (-1 to 1)
│   └── phase: number (0-2π)
│
└── Mappings
    ├── lfoId → parameterRef[]
    └── Each mapping has: min, max, mode (add/multiply/replace)
```

### New Files
- `src/renderer/engine/modulation/LFO.ts` - Single LFO oscillator
- `src/renderer/engine/modulation/LFOManager.ts` - Manages multiple LFOs
- `src/renderer/components/LFOPanel.tsx` - UI for LFO configuration

### LFO Waveforms
```glsl
// Waveform functions (in TypeScript for parameter modulation)
sine(t) = sin(t * 2π)
square(t) = sign(sin(t * 2π))
saw(t) = (t % 1) * 2 - 1
triangle(t) = abs(((t * 2) % 2) - 1) * 2 - 1
random(t) = noise(floor(t * freq))
```

### Integration Points
- Effect parameters can be "modulation targets"
- ParameterPanel shows modulation indicator when LFO attached
- LFOs update in the render loop before effects process

---

## Phase 3: MIDI Integration Enhancement

### Current State
- ✅ MIDI CC learning works
- ✅ Basic mapping stored in MidiManager
- ❌ No persistence (lost on reload)
- ❌ No visual feedback of current mappings
- ❌ No MIDI output (for controller feedback)

### Enhancements

#### 3.1 Mapping Persistence
```typescript
interface MidiMapping {
    midiId: string;          // "channel:cc" e.g., "0:1"
    targetType: 'effect' | 'lfo' | 'mixer';
    targetId: string;        // effect.id or lfo.id
    parameterId: string;     // parameter name
    min: number;
    max: number;
}

// Store in localStorage or file
```

#### 3.2 Visual Mapping Display
- Show current MIDI mappings in ParameterPanel
- Indicator when CC is actively modulating
- "Unmap" button to remove assignments

#### 3.3 MIDI Device Selection
- List available MIDI inputs
- Allow selecting specific device
- Show device connection status

---

## Phase 4: Recording/Output

### 4.1 Canvas Recording (MediaRecorder)
```typescript
// RecordingManager.ts
class RecordingManager {
    private canvas: HTMLCanvasElement;
    private mediaRecorder: MediaRecorder | null;
    private chunks: Blob[];

    startRecording(canvas: HTMLCanvasElement, options: RecordingOptions);
    stopRecording(): Promise<Blob>;
    downloadRecording(filename: string);
}
```

### 4.2 Recording Options
- **Format**: WebM (VP8/VP9), MP4 (if supported)
- **Quality**: bitrate control (1-50 Mbps)
- **Resolution**: Match canvas or custom
- **Audio**: Optional audio track from system/file

### 4.3 Export Features
- Save individual frames as PNG
- Export video with timestamp
- Auto-naming with effect stack info

### 4.4 Future: Syphon/NDI (Phase 2 of Recording)
- Requires native Electron integration
- Syphon: macOS only, use syphon-shared-memory
- NDI: Cross-platform, use grandiose library

---

## Phase 5: Multiple Inputs

### Architecture

```
InputManager
├── sources: VideoSource[]  // Multiple video inputs
├── activeSource: number    // Currently selected for effects
│
└── Mixer
    ├── sourceA: VideoSource
    ├── sourceB: VideoSource
    ├── crossfader: number (0=A, 1=B)
    ├── blendMode: 'crossfade' | 'add' | 'multiply' | 'difference'
    └── output: THREE.Texture
```

### UI Components
- Source selector dropdown for each slot
- A/B buttons for quick switching
- Crossfader slider
- Blend mode selector

### Blend Modes (GLSL)
```glsl
// Crossfade
mix(colorA, colorB, crossfader)

// Add
clamp(colorA + colorB, 0.0, 1.0)

// Multiply
colorA * colorB

// Difference
abs(colorA - colorB)

// Screen
1.0 - (1.0 - colorA) * (1.0 - colorB)
```

---

## Implementation Order

### Sprint 1: Core Effects (Week 1-2)
1. Create effect registry system
2. Implement: Feedback, Mirror, Kaleidoscope, EdgeDetect
3. Implement: Pixelate, Posterize, Invert, Scanlines

### Sprint 2: LFO System (Week 2-3)
1. LFO oscillator core
2. LFOManager with mapping
3. LFO UI panel
4. Integration with Effect parameters

### Sprint 3: Advanced Effects + MIDI Polish (Week 3-4)
1. Implement: LumaKey, ChromaKey, VHS, Displacement
2. MIDI mapping persistence
3. MIDI visual feedback
4. Device selection UI

### Sprint 4: Recording (Week 4-5)
1. MediaRecorder integration
2. Recording controls UI
3. Quality/format options
4. Frame capture feature

### Sprint 5: Multi-Input (Week 5-6)
1. InputManager architecture
2. Source A/B system
3. Mixer with blend modes
4. Crossfader UI

---

## File Structure After Implementation

```
src/renderer/
├── engine/
│   ├── effects/
│   │   ├── Effect.ts
│   │   ├── index.ts (registry)
│   │   ├── BlurEffect.ts
│   │   ├── GlitchEffect.ts
│   │   ├── ColoramaEffect.ts
│   │   ├── FeedbackEffect.ts     [NEW]
│   │   ├── MirrorEffect.ts       [NEW]
│   │   ├── KaleidoscopeEffect.ts [NEW]
│   │   ├── EdgeDetectEffect.ts   [NEW]
│   │   ├── PixelateEffect.ts     [NEW]
│   │   ├── PosterizeEffect.ts    [NEW]
│   │   ├── InvertEffect.ts       [NEW]
│   │   ├── ScanlinesEffect.ts    [NEW]
│   │   ├── LumaKeyEffect.ts      [NEW]
│   │   ├── ChromaKeyEffect.ts    [NEW]
│   │   ├── VHSEffect.ts          [NEW]
│   │   └── DisplacementEffect.ts [NEW]
│   ├── modulation/               [NEW]
│   │   ├── LFO.ts
│   │   └── LFOManager.ts
│   ├── input/                    [NEW]
│   │   ├── InputManager.ts
│   │   └── Mixer.ts
│   ├── EffectChain.ts
│   └── VideoSource.ts
├── services/
│   ├── MidiManager.ts (enhanced)
│   └── RecordingManager.ts       [NEW]
└── components/
    ├── PreviewWindow.tsx
    ├── EffectStack.tsx (enhanced)
    ├── ParameterPanel.tsx (enhanced)
    ├── LFOPanel.tsx              [NEW]
    ├── RecordingControls.tsx     [NEW]
    └── InputMixer.tsx            [NEW]
```

---

## Getting Started

Starting with **Phase 1: More Effects** as it provides the most immediate value and establishes patterns for the rest of the development.

First batch: Feedback, Mirror, Kaleidoscope, EdgeDetect, Pixelate
