import React, { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useFBO } from '@react-three/drei';
import { Mixer } from '../engine/Mixer';
import { SourceManager } from '../engine/SourceManager';
import { EffectChain } from '../engine/EffectChain';
import { LFOManager } from '../engine/modulation/LFOManager';

interface PreviewWindowProps {
    mixer: Mixer;
    sourceManager: SourceManager;
    effectChain?: EffectChain;
    lfoManager?: LFOManager;
}

interface EffectComposerProps {
    mixer: Mixer;
    sourceManager: SourceManager;
    effectChain?: EffectChain;
    lfoManager?: LFOManager;
}

const EffectComposer: React.FC<EffectComposerProps> = ({ mixer, sourceManager, effectChain, lfoManager }) => {
    const { gl, size, camera } = useThree();
    const fbo1 = useFBO(size.width, size.height);
    const fbo2 = useFBO(size.width, size.height);

    const videoMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({ toneMapped: false });
    }, []);

    const finalMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({ toneMapped: false });
    }, []);

    const quadScene = useMemo(() => {
        const s = new THREE.Scene();
        const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), videoMaterial);
        s.add(m);
        return { scene: s, mesh: m as THREE.Mesh<THREE.PlaneGeometry, THREE.Material> };
    }, [videoMaterial]);

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();

        // 1. Render Mixer to get base texture
        const mixedTexture = mixer.render(gl, sourceManager.getTextureA(), sourceManager.getTextureB());

        let inputTexture: THREE.Texture = mixedTexture;
        let writeFBO = fbo1;
        let readFBO = fbo2;

        const effects = effectChain?.getEffects() || [];

        // Apply LFO modulation before rendering
        if (lfoManager && effects.length > 0) {
            lfoManager.update(time, effects);
        }

        if (effects.length === 0) {
            gl.setRenderTarget(null);
            videoMaterial.map = inputTexture;
            quadScene.mesh.material = videoMaterial;
            gl.render(quadScene.scene, camera);
            videoMaterial.map = null;
            return;
        }

        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i];
            effect.update(time);
            effect.uniforms.tDiffuse.value = inputTexture;

            gl.setRenderTarget(writeFBO);
            quadScene.mesh.material = effect.material;
            gl.render(quadScene.scene, camera);

            inputTexture = writeFBO.texture;
            const temp = writeFBO;
            writeFBO = readFBO;
            readFBO = temp;
        }

        gl.setRenderTarget(null);
        finalMaterial.map = inputTexture;
        quadScene.mesh.material = finalMaterial;
        gl.render(quadScene.scene, camera);
        finalMaterial.map = null;
    }, 1);

    return null;
};

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ mixer, sourceManager, effectChain, lfoManager }) => {
    return (
        <div style={{ width: '100%', height: '100%', background: '#000' }}>
            <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 1] }} linear flat>
                <EffectComposer mixer={mixer} sourceManager={sourceManager} effectChain={effectChain} lfoManager={lfoManager} />
            </Canvas>
        </div>
    );
};
