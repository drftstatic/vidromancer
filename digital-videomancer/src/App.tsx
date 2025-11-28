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
import { OutputControls } from './renderer/components/OutputControls'

function App() {
  const sourceManager = useMemo(() => new SourceManager(), []);
  const mixer = useMemo(() => new Mixer(), []);
  const effectChain = useMemo(() => new EffectChain(), []);
  const midiManager = useMemo(() => new MidiManager(), []);
  const lfoManager = useMemo(() => new LFOManager(), []);
  const recorderManager = useMemo(() => new RecorderManager(), []);

  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    midiManager.init();
    return () => {
      sourceManager.dispose();
    };
  }, [sourceManager, midiManager]);


  const handleUpdate = () => {
    setTick(t => t + 1);
  };

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#111' }}>
      <div className="toolbar" style={{ padding: '10px', background: '#333', color: 'white', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <OutputControls recorderManager={recorderManager} />
      </div>
      <div className="workspace" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '250px' }}>
          <EffectStack
            chain={effectChain}
            selectedEffectId={selectedEffect?.id || null}
            onSelectEffect={setSelectedEffect}
            onUpdate={handleUpdate}
          />
          <div style={{ marginTop: 'auto' }}>
            <MidiSettings midiManager={midiManager} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="viewport" style={{ flex: 1, position: 'relative', background: 'black' }}>
            <PreviewWindow mixer={mixer} sourceManager={sourceManager} effectChain={effectChain} lfoManager={lfoManager} />
          </div>
          <LFOPanel
            lfoManager={lfoManager}
            effects={effectChain.getEffects()}
            onUpdate={handleUpdate}
          />
          <MixerControls mixer={mixer} sourceManager={sourceManager} />
        </div>
        <ParameterPanel effect={selectedEffect} midiManager={midiManager} lfoManager={lfoManager} />
      </div>
    </div>
  )
}

export default App
