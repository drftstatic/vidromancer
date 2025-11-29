# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vidromancer is a real-time video effects console built as an Electron desktop application. It's designed for VJs, motion artists, and content creators who need live visual performance with hardware-synth-inspired interfaces.

## Repository Structure

```
vidromancer/
├── vidromancer/         # Main Electron app (React + Three.js + Vite)
│   ├── electron/        # Electron main/preload process (CommonJS)
│   ├── src/
│   │   ├── App.tsx      # Main React component with console layout
│   │   ├── renderer/
│   │   │   ├── engine/  # Video processing pipeline
│   │   │   │   ├── effects/      # GLSL shader effects (Effect base class)
│   │   │   │   ├── modulation/   # LFO and audio-reactive modulation
│   │   │   │   └── visualizers/  # Audio visualization components
│   │   │   ├── components/       # React UI components
│   │   │   └── services/         # MIDI, audio, recording managers
│   │   └── main.tsx
│   └── dist-electron/   # Compiled Electron files
└── landing-page/        # Marketing site (Vite + React)
```

## Commands

All commands run from root directory (will `cd` into correct subdirectory):

```bash
# Development (launches Electron with hot-reload)
npm run dev

# Build production app (outputs to vidromancer/release/)
npm run build

# Lint
npm run lint

# From vidromancer/ directly:
cd vidromancer && npm run dev
cd vidromancer && npm run build
cd vidromancer && npm run lint
```

## Architecture

### Module System
- **Main process**: CommonJS (Electron runtime)
- **Preload**: CommonJS with contextIsolation
- **Renderer**: ESM via Vite (React app)

Vite config handles this split via `vite-plugin-electron`. The `electron` package must be external in rollup to use Electron's built-in module at runtime.

### Video Pipeline
1. **SourceManager** manages video inputs (webcam, file, screen capture)
2. **Mixer** handles A/B source crossfading with blend modes
3. **EffectChain** stacks multiple effects in sequence
4. **Effects** are GLSL fragment shaders wrapped in the `Effect` base class

### Effect System Pattern
Effects extend the `Effect` base class with GLSL shaders:
```typescript
export class NewEffect extends Effect {
    constructor() {
        super('EffectName', fragmentShader, [
            { id: 'param1', label: 'Label', type: 'float', min: 0, max: 1, defaultValue: 0.5 },
        ]);
    }
}
```

New effects must be registered in `src/renderer/engine/effects/index.ts`.

### Modulation
- **LFOManager**: Multiple oscillators (sine, square, saw, triangle, random) that modulate effect parameters
- **AudioReactiveManager**: Maps audio analysis (spectrum, waveform) to parameters
- **MidiManager**: MIDI CC learning and parameter mapping

### Key Services
- **AudioManager** (`services/AudioManager.ts`): Web Audio API for analysis, FFT data
- **MidiManager** (`services/MidiManager.ts`): Web MIDI API, CC learning
- **RecorderManager** (`services/RecorderManager.ts`): MediaRecorder for video capture

## Development Notes

### Electron Environment
The vite config includes a critical `onstart` hook that removes `ELECTRON_RUN_AS_NODE` from the environment—this is necessary when launching from VS Code or other Node-based environments.

### Permissions
The main process (`electron/main.ts`) auto-grants media permissions for webcam/microphone access without prompts.

### Current Effects
Blur, Glitch, Colorama, Feedback, Mirror, Kaleidoscope, EdgeDetect, Pixelate, Posterize, Invert, Scanlines, LumaKey, VHS, Displacement, AudioSpectrum, AudioWaveform, AudioGlow

### Build Output
- Renderer: `vidromancer/dist/`
- Electron: `vidromancer/dist-electron/`
- Installers: `vidromancer/release/{version}/`

Platform builds configured in `electron-builder.json5`:
- macOS: DMG
- Windows: NSIS installer
- Linux: AppImage
