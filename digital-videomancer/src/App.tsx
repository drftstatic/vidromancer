import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { SourceManager } from './renderer/engine/SourceManager'
import { Mixer } from './renderer/engine/Mixer'
import { MixerControls } from './renderer/components/MixerControls'
import { PreviewWindow } from './renderer/components/PreviewWindow'
import { EffectChain } from './renderer/engine/EffectChain'
import { EffectStack } from './renderer/components/EffectStack'
import { ParameterPanel } from './renderer/components/ParameterPanel'
import { LFOPanel } from './renderer/components/LFOPanel'
import { Effect } from './renderer/engine/effects/Effect'
import { MidiManager } from './renderer/services/MidiManager'
import { LFOManager } from './renderer/engine/modulation/LFOManager'
import { MidiSettings } from './renderer/components/MidiSettings'
import { RecorderManager } from './renderer/services/RecorderManager'

function App() {
  const sourceManager = useMemo(() => new SourceManager(), []);
  const mixer = useMemo(() => new Mixer(), []);
  const effectChain = useMemo(() => new EffectChain(), []);
  const midiManager = useMemo(() => new MidiManager(), []);
  const lfoManager = useMemo(() => new LFOManager(), []);
  const recorderManager = useMemo(() => new RecorderManager(), []);

  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);
  const [, setTick] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    midiManager.init();
    return () => {
      sourceManager.dispose();
    };
  }, [sourceManager, midiManager]);

  const handleUpdate = () => {
    setTick(t => t + 1);
  };

  const handleRecord = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    if (isRecording) {
      recorderManager.stopRecording();
      setIsRecording(false);
    } else {
      recorderManager.startRecording(canvas);
      setIsRecording(true);
    }
  };

  const handleSnapshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    recorderManager.takeSnapshot(canvas);
  };

  const handlePopOut = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const win = window.open('', 'Output Window', 'width=1280,height=720');
    if (!win) return;

    win.document.body.style.margin = '0';
    win.document.body.style.background = 'black';
    win.document.title = 'Digital Videomancer Output';

    const newCanvas = win.document.createElement('canvas');
    newCanvas.width = 1280;
    newCanvas.height = 720;
    newCanvas.style.width = '100%';
    newCanvas.style.height = '100%';
    win.document.body.appendChild(newCanvas);

    const ctx = newCanvas.getContext('2d');

    const update = () => {
      if (win.closed) return;
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
      }
      requestAnimationFrame(update);
    };
    update();
  };

  return (
    <div className="videomancer-console">
      {/* Top Jack Strip - I/O Connectors */}
      <div className="jack-strip">
        <div className="panel-screw" />

        <div className="brand-logo">
          <span className="star">*</span>
          videomancer
          <span className="star">*</span>
        </div>

        <div className="strip-divider" />

        <div className="jack-group">
          <span className="jack-group-label">CV IN</span>
          <div className="jack-connector" title="CV 1" />
          <div className="jack-connector" title="CV 2" />
          <div className="jack-connector" title="CV 3" />
          <div className="jack-connector" title="CV 4" />
        </div>

        <div className="strip-divider" />

        <div className="jack-group">
          <span className="jack-group-label">MIDI</span>
          <div className="jack-connector active" title="MIDI In" />
          <div className="jack-connector" title="MIDI Out" />
        </div>

        <div className="strip-divider" />

        <div className="jack-group">
          <span className="jack-group-label">VIDEO</span>
          <div className="jack-connector active" title="HDMI In" />
          <div className="jack-connector" title="Composite" />
        </div>

        <div className="lcd-status">
          <div className="lcd-status-display">
            VIDEOMANCER v1.0
          </div>
        </div>

        <div className="panel-screw" />
      </div>

      {/* Main Workspace */}
      <div className="console-workspace">
        {/* Left Panel - Effects */}
        <div className="left-panel">
          <EffectStack
            chain={effectChain}
            selectedEffectId={selectedEffect?.id || null}
            onSelectEffect={setSelectedEffect}
            onUpdate={handleUpdate}
          />
          <MidiSettings midiManager={midiManager} />
        </div>

        {/* Center Panel - Preview & LFO */}
        <div className="center-panel">
          <div className="preview-monitor">
            <PreviewWindow
              mixer={mixer}
              sourceManager={sourceManager}
              effectChain={effectChain}
              lfoManager={lfoManager}
            />
          </div>
          <LFOPanel
            lfoManager={lfoManager}
            effects={effectChain.getEffects()}
            onUpdate={handleUpdate}
          />
        </div>

        {/* Right Panel - Parameters */}
        <div className="right-panel">
          <div className="parameter-section">
            <ParameterPanel
              effect={selectedEffect}
              midiManager={midiManager}
              lfoManager={lfoManager}
            />
          </div>

          {/* T-Bar Fader */}
          <div className="tbar-section">
            <span className="tbar-label">MIX</span>
            <div className="tbar-track">
              <div className="tbar-notches">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div key={i} className="tbar-notch" />
                ))}
              </div>
            </div>
            <div className="tbar-labels">
              <span>A</span>
              <span>B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Strip */}
      <div className="bottom-strip">
        <div className="mixer-section">
          <MixerControls mixer={mixer} sourceManager={sourceManager} />
        </div>

        <div className="transport-section">
          <button
            className={`transport-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleRecord}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </button>

          <button
            className="transport-btn"
            onClick={handleSnapshot}
            title="Take Snapshot"
          >
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <button
            className="transport-btn"
            onClick={handlePopOut}
            title="Pop-out Output Window"
          >
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M9 3v6H3" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
