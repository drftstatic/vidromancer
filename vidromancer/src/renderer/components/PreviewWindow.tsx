import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
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

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ mixer, sourceManager, effectChain, lfoManager }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create scene and camera for final output
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const quad = new THREE.Mesh(geometry, material);
        scene.add(quad);

        // Create FBOs for effect chain
        let fbo1 = new THREE.WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height);
        let fbo2 = new THREE.WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height);

        const clock = new THREE.Clock();

        // DEBUG: Test that basic rendering works
        console.log('[PreviewWindow] Renderer initialized, canvas size:', renderer.domElement.width, 'x', renderer.domElement.height);

        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Get textures
            const texA = sourceManager.getTextureA();
            const texB = sourceManager.getTextureB();

            // Check video ready state
            const videoA = sourceManager.sourceA?.video;
            const videoB = sourceManager.sourceB?.video;
            const hasVideoA = videoA && videoA.readyState >= 2;
            const hasVideoB = videoB && videoB.readyState >= 2;

            // Mark video textures for update
            if (texA && hasVideoA) {
                texA.needsUpdate = true;
            }
            if (texB && hasVideoB) {
                texB.needsUpdate = true;
            }

            // If no video loaded, show a test pattern (cycling color)
            if (!hasVideoA && !hasVideoB) {
                const r = Math.sin(time) * 0.5 + 0.5;
                const g = Math.sin(time + 2) * 0.5 + 0.5;
                const b = Math.sin(time + 4) * 0.5 + 0.5;
                material.color.setRGB(r, g, b);
                material.map = null;
                material.needsUpdate = true;
                renderer.setRenderTarget(null);
                renderer.render(scene, camera);
                return;
            }

            // Render mixer
            const mixedTexture = mixer.render(renderer, texA, texB);

            let inputTexture: THREE.Texture = mixedTexture;
            const effects = effectChain?.getEffects() || [];

            // Apply LFO modulation
            if (lfoManager && effects.length > 0) {
                lfoManager.update(time, effects);
            }

            if (effects.length === 0) {
                // No effects - render directly to screen
                renderer.setRenderTarget(null);
                material.map = inputTexture;
                material.color.setRGB(1, 1, 1); // Reset color to white so texture shows
                material.needsUpdate = true;
                quad.material = material;
                renderer.render(scene, camera);
            } else {
                // Process effect chain
                let writeFBO = fbo1;
                let readFBO = fbo2;

                for (let i = 0; i < effects.length; i++) {
                    const effect = effects[i];
                    effect.update(time);
                    effect.uniforms.tDiffuse.value = inputTexture;

                    renderer.setRenderTarget(writeFBO);
                    quad.material = effect.material;
                    renderer.render(scene, camera);

                    inputTexture = writeFBO.texture;
                    const temp = writeFBO;
                    writeFBO = readFBO;
                    readFBO = temp;
                }

                // Final render to screen
                renderer.setRenderTarget(null);
                material.map = inputTexture;
                material.color.setRGB(1, 1, 1);
                material.needsUpdate = true;
                quad.material = material;
                renderer.render(scene, camera);
            }
        };

        animate();

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !renderer) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            renderer.setSize(width, height);
            fbo1.setSize(width, height);
            fbo2.setSize(width, height);
            mixer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);
        // Initial size
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationRef.current);
            renderer.dispose();
            fbo1.dispose();
            fbo2.dispose();
            geometry.dispose();
            material.dispose();
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [mixer, sourceManager, effectChain, lfoManager]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                background: '#000',
                minHeight: '300px'
            }}
        />
    );
};
