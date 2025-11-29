# Vidromancer

<p align="center">
  <img src="landing-page/public/icon.png" alt="Vidromancer Logo" width="120" />
</p>

<p align="center">
  <strong>A real-time video effects console for live visual performance and experimentation.</strong>
</p>

<p align="center">
  <a href="https://github.com/drftstatic/vidromancer/releases/latest">
    <img src="https://img.shields.io/github/v/release/drftstatic/vidromancer?include_prereleases&label=download&style=for-the-badge" alt="Download" />
  </a>
  <img src="https://img.shields.io/badge/platform-macOS%20(Apple%20Silicon)-blue?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/status-beta-orange?style=for-the-badge" alt="Status" />
</p>

---

## What is Vidromancer?

Vidromancer is a desktop application for creating and performing real-time video effects. Inspired by classic video synthesizers and modern creative coding tools, it provides a visual playground for artists, VJs, and experimenters.

**This is a [Fladry Creative](https://fladrycreative.com) experiment.**

### Key Features

- **Real-time GPU-accelerated effects** — 60 FPS performance using WebGL/Three.js
- **15+ built-in effects** — Colorama, feedback, glitch, kaleidoscope, VHS, scanlines, and more
- **Dual video source mixing** — Load videos, images, or use your webcam
- **Audio-reactive visuals** — Effects respond to audio input with spectrum and waveform analysis
- **LFO modulation** — Automate any parameter with sine, square, triangle, or random waveforms
- **MIDI control** — Map hardware controllers to any parameter for live performance
- **Effect chaining** — Stack and reorder effects with drag-and-drop
- **Recording output** — Capture your creations as video files

## Screenshots

*Coming soon*

## Installation

### Download (Recommended)

Download the latest release for macOS (Apple Silicon):

**[Download Vidromancer v0.1.0-beta](https://github.com/drftstatic/vidromancer/releases/latest)**

> **Note:** This is an unsigned beta release. On first launch:
> 1. Right-click the app and select "Open"
> 2. Click "Open" in the security dialog
>
> Or run in Terminal:
> ```bash
> xattr -cr /Applications/Vidromancer.app
> ```

### System Requirements

- macOS 12+ (Monterey or later)
- Apple Silicon (M1/M2/M3)
- 4GB RAM minimum
- GPU with WebGL 2.0 support

## Building from Source

### Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)
- macOS with Xcode Command Line Tools

### Development Setup

```bash
# Clone the repository
git clone https://github.com/drftstatic/vidromancer.git
cd vidromancer

# Navigate to the app directory
cd vidromancer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build
```

The installer will be created in `vidromancer/release/`.

## Project Structure

```
vidromancer/
├── vidromancer/           # Electron application
│   ├── src/
│   │   ├── renderer/
│   │   │   ├── engine/    # Core rendering engine
│   │   │   │   ├── effects/       # GPU shader effects
│   │   │   │   ├── modulation/    # LFO and audio-reactive
│   │   │   │   └── visualizers/   # Audio visualizers
│   │   │   ├── components/        # React UI components
│   │   │   └── services/          # MIDI, Audio, Recording
│   │   └── App.tsx
│   ├── electron/          # Electron main process
│   └── package.json
├── landing-page/          # Marketing website
└── README.md
```

## Tech Stack

- **Electron** — Cross-platform desktop framework
- **React 18** — UI components
- **Three.js / React Three Fiber** — GPU-accelerated rendering
- **TypeScript** — Type-safe codebase
- **Vite** — Fast development and builds
- **Web Audio API** — Audio analysis
- **Web MIDI API** — Hardware controller support

## Available Effects

| Effect | Description |
|--------|-------------|
| Colorama | HSL color cycling and shifting |
| Feedback | Video feedback delay loops |
| Glitch | Digital distortion artifacts |
| Kaleidoscope | Radial symmetry patterns |
| Mirror | Horizontal/vertical reflection |
| Blur | Gaussian blur with radius control |
| Pixelate | Retro pixel reduction |
| Posterize | Color quantization |
| Edge Detect | Sobel edge detection |
| Scanlines | CRT monitor simulation |
| VHS | Analog tape distortion |
| Invert | Color inversion |
| Displacement | Texture-based warping |
| Luma Key | Brightness-based transparency |
| Audio Spectrum | Frequency visualization |
| Audio Waveform | Time-domain visualization |
| Audio Glow | Beat-reactive glow effects |

## Roadmap

- [ ] Windows support
- [ ] Syphon/Spout output for VJ software integration
- [ ] Preset save/load system
- [ ] Additional effects and blend modes
- [ ] NDI input/output
- [ ] OSC control support

## Contributing

This is an experimental project and not currently accepting contributions. However, feedback and bug reports are welcome!

## License

MIT License — See [LICENSE](LICENSE) for details.

## Contact

**Fladry Creative**
robb@fladrycreative.com

---

<p align="center">
  <sub>Built with obsession by <a href="https://fladrycreative.com">Fladry Creative</a></sub>
</p>
