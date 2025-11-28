# Vidromancer

A real-time video effects console for live visual performance and experimentation.

## Project Structure

- `vidromancer/`: The main Electron application (Electron + Vite + React + Three.js)
- `landing-page/`: Marketing and beta sign-up page

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository (if you haven't already).
2. Navigate to the app directory:
   ```bash
   cd vidromancer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

This will launch the Electron application with hot-reload enabled.

### Building

To build the application for production:

```bash
npm run build
```

The output will be in the `vidromancer/dist` (renderer) and `vidromancer/release` (executable) directories.

## Best Practices

- **Large Files**: Do not commit large video or audio files to the repository. The `.gitignore` is configured to exclude common media formats (`.mp4`, `.mov`, `.wav`, etc.).
- **Environment Variables**: Use `.env` files for sensitive configuration. These are ignored by git.
- **Linting**: Run `npm run lint` to check for code style issues.

## Multi-Machine Setup

1. **Clone**: `git clone <repo-url>`
2. **Install**: `cd vidromancer && npm install`
3. **Run**: `npm run dev`

Note: `node_modules` and build artifacts are not shared via git, so you must install dependencies on each machine.
