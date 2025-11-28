import { VideoSource, VideoSourceType } from './VideoSource';

export class SourceManager {
    sourceA: VideoSource;
    sourceB: VideoSource;

    constructor() {
        this.sourceA = new VideoSource();
        this.sourceB = new VideoSource();
    }

    async setSourceA(type: VideoSourceType, url?: string) {
        await this.sourceA.setSource(type, url);
    }

    async setSourceB(type: VideoSourceType, url?: string) {
        await this.sourceB.setSource(type, url);
    }

    getTextureA() {
        return this.sourceA.texture;
    }

    getTextureB() {
        return this.sourceB.texture;
    }

    dispose() {
        this.sourceA.dispose();
        this.sourceB.dispose();
    }
}
