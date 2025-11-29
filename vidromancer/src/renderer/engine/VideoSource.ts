import * as THREE from 'three';

export type VideoSourceType = 'webcam' | 'file' | 'none';

export class VideoSource {
  public video: HTMLVideoElement;
  public texture: THREE.VideoTexture;
  public type: VideoSourceType = 'none';
  public hasAudio: boolean = false;
  private _muted: boolean = true;

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
    console.log('[VideoSource] setSource called:', type, url);
    this.stop();
    this.type = type;

    if (type === 'webcam') {
      try {
        console.log('[VideoSource] Requesting webcam...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('[VideoSource] Got webcam stream:', stream);
        this.video.srcObject = stream;
        await this.video.play();
        console.log('[VideoSource] Webcam playing, video dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
      } catch (err) {
        console.error('[VideoSource] Error accessing webcam:', err);
        this.type = 'none';
      }
    } else if (type === 'file' && url) {
      console.log('[VideoSource] Loading file:', url);
      this.video.srcObject = null;
      this.video.src = url;
      try {
        await this.video.play();
        console.log('[VideoSource] File playing, video dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
      } catch (err) {
        console.error('[VideoSource] Error playing file:', err);
      }
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

  // Get video element for audio extraction
  getVideoElement(): HTMLVideoElement {
    return this.video;
  }

  // Control audio playback (mute/unmute)
  setMuted(muted: boolean) {
    this._muted = muted;
    this.video.muted = muted;
  }

  isMuted(): boolean {
    return this._muted;
  }

  // Check if video has audio tracks
  checkAudio(): boolean {
    // For file sources, check if video has audio tracks
    if (this.type === 'file' && this.video.src) {
      // Use mozHasAudio or webkitAudioDecodedByteCount for detection
      const video = this.video as HTMLVideoElement & {
        mozHasAudio?: boolean;
        webkitAudioDecodedByteCount?: number;
        audioTracks?: { length: number };
      };

      if (video.mozHasAudio !== undefined) {
        this.hasAudio = video.mozHasAudio;
      } else if (video.webkitAudioDecodedByteCount !== undefined) {
        this.hasAudio = video.webkitAudioDecodedByteCount > 0;
      } else if (video.audioTracks !== undefined) {
        this.hasAudio = video.audioTracks.length > 0;
      } else {
        // Assume has audio if we can't detect
        this.hasAudio = true;
      }
    } else {
      this.hasAudio = false;
    }
    return this.hasAudio;
  }
}
