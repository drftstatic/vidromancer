export class RecorderManager {
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
    private isRecording: boolean = false;

    startRecording(canvas: HTMLCanvasElement) {
        const stream = canvas.captureStream(60); // 60 FPS
        const options = { mimeType: 'video/webm; codecs=vp9' };

        try {
            this.mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.warn('VP9 not supported, falling back to default');
            this.mediaRecorder = new MediaRecorder(stream);
        }

        this.chunks = [];
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${new Date().toISOString()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        };

        this.mediaRecorder.start();
        this.isRecording = true;
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    takeSnapshot(canvas: HTMLCanvasElement) {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot-${new Date().toISOString()}.png`;
        a.click();
    }

    getIsRecording() {
        return this.isRecording;
    }
}
