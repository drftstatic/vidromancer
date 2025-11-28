import React, { useState } from 'react';
import { RecorderManager } from '../services/RecorderManager';

interface OutputControlsProps {
    recorderManager: RecorderManager;
}

export const OutputControls: React.FC<OutputControlsProps> = ({ recorderManager }) => {
    const [isRecording, setIsRecording] = useState(false);

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
        <div className="output-controls" style={{ padding: '10px', background: '#222', color: '#eee', display: 'flex', gap: '10px' }}>
            <button
                onClick={handleRecord}
                style={{
                    background: isRecording ? 'red' : '#444',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button onClick={handleSnapshot}>Snapshot</button>
            <button onClick={handlePopOut}>Pop-out Output</button>
        </div>
    );
};
