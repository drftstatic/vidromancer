Product Requirements Document (PRD): Digital Videomancer

1. Overview

Product: Digital Videomancer (standalone app/plugin/web/FPGA hybrid)

Objective: Deliver a self-contained video effect instrument inspired by the LZX Videomancer, enabling real-time effect manipulation, low-latency I/O, and modular creative workflows for motion artists, VJs, and content creators.

Stakeholders: Product Owner, Design Lead, Engineering Lead, QA, Beta Testers, Digital Artists

2. Goals & Non-goals

Goals

Recreate core real-time visual effect experience of Videomancer in a digital/software medium.

Provide deep MIDI/automation and modulation mapping comparable to physical modular synth workflows.

Support live video, file, and stream-based workflows for modern content and performance needs.

Non-goals

Direct analog video hardware integration (handled via capture hardware)

Replicating the exact tactile experience of patch cables/CV (virtual/mapped equivalents only)

Long-term maintenance of closed hardware systems (open/standard protocol focus)

3. User Stories

As a VJ/artist, I want to apply, mix, and live-control classic and experimental video effects to live or pre-recorded video.

As a performer, I want to automate effect parameters with MIDI, OSC, and audio/CV input, ensuring expressive modulation.

As a designer/developer, I want to build and share my own effect modules or scripts easily.

4. Feature Table (with Must/Should/Could)

Feature	Must	Should	Could	Notes
Real-time video processing	X			Sub-16ms latency, core pipeline
Modular effect “programs”	X			6+ shipped, user-loadable extra
Effect stack/chain editor	X			Visual UI for reordering
MIDI parameter mapping	X			Learn mode & surfaces
Audio/CV signal modulation	X			Live, assignable sources
Preset management/snapshots	X			Per effect & global
Desktop app (Win/Mac/Linux)	X			Electron, QT, or similar
Video I/O (USB, file, screen)	X			NDI/Spout “should” (perf)
GPU/FPGA acceleration		X		Max performance, optional board
Mobile version (iOS/Android)			X	Future extension
Scripting/custom plugins		X		JS/Python/Lua
Embedded/FPGA mode		X		Optional bitstream mode
Remote preset share/cloud			X	Community banks
5. Technical Requirements

Cross-platform desktop app using hardware-accelerated video.

Device/OS-level MIDI engine and learn system.

Modular processing engine (supporting third-party effects).

Plugin/extension system using open standards.

“Performance Mode” for streamlined, full-screen low-latency output.

6. User Interface

Effect Chain View: Blocks for each effect, drag to reorder/bypass.

Parameter/Macro Panel: For each effect, real-time value change, assign LFO/MIDI/Audio.

Preview/Output Window: Live processed video, toggle aspect ratio and overlays.

Preset Bar: Save/recall user setups instantly.

Routing UI: Simple picker for video/audio sources and outputs.

Performance Overlay: Display system stats, parameter changes, MIDI assignments.

7. Example Milestones/Timeline

M1: Architecture, real-time pipeline proof, effect plugin API

M2: UI/UX foundation, 3 demo effects (blur, glitch, colorama)

M3: MIDI/Audio/CV modulation, preset system, effect stacking

M4: Beta release, full 6-program effect suite, user scripting, NDI/Spout support

M5: User documentation, in-app updater, public release

8. Success Metrics

Sub-16ms average visual latency (benchmarked on common hardware)

6+ core effects fully modulateable at release; user can load community effects

95% stability after 20h continuous live use (robustness)

50+ MIDI/automation assignments, rapid preset switching

Positive artist/beta user feedback on modulateability, usability, and output quality
