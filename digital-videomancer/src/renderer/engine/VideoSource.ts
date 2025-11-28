import * as THREE from 'three';

export type VideoSourceType = 'webcam' | 'file' | 'none';

export class VideoSource {
  public video: HTMLVideoElement;
  public texture: THREE.VideoTexture;
  public type: VideoSourceType = 'none';

  constructor() {
    this.video = document.createElement('video');
    this.video.crossOrigin = 'anonymous';
    this.video.loop = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.autoplay = true;

    this.texture = new THREE.VideoTexture(this.video);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.format = THREE.RGBAFormat;
  }

  async setSource(type: VideoSourceType, url?: string) {
    this.stop();
    this.type = type;

    if (type === 'webcam') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.video.srcObject = stream;
        await this.video.play();
      } catch (err) {
        console.error('Error accessing webcam:', err);
        this.type = 'none';
      }
    } else if (type === 'file' && url) {
      this.video.srcObject = null;
      this.video.src = url;
      await this.video.play();
    } else {
      this.type = 'none';
    }
  }

  stop() {
    if (this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.video.pause();
    this.video.src = '';
  }

  dispose() {
    this.stop();
    this.texture.dispose();
  }
}
