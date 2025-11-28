# Vidromancer

**A Fladry Creative Experiment** | [fladrycreative.com](https://fladrycreative.com)

Real-time video effects console with hardware-inspired interface.

## Features

- Real-time video mixing with crossfade and blend modes
- GPU-accelerated effect chain processing
- MIDI parameter mapping with learn mode
- LFO modulation for all parameters
- Webcam and video file input
- Recording and snapshot capture
- Pop-out output window

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Electron** - Desktop application framework
- **React** - UI components
- **Three.js** - WebGL rendering and shader effects
- **TypeScript** - Type safety
- **Vite** - Build tooling

## Architecture

```
src/
├── renderer/
│   ├── components/    # UI components
│   ├── engine/        # Video processing engine
│   │   ├── effects/   # GPU shader effects
│   │   └── modulation/ # LFO system
│   └── services/      # MIDI, recording
└── electron/          # Main process
```

## License

MIT
