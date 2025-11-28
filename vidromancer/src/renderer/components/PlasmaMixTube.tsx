import React from 'react';
import './PlasmaMixTube.css';

interface PlasmaMixTubeProps {
    mixValue: number; // 0 to 1
    signalIntensity?: number; // 0 to 1, optional for now
}

export const PlasmaMixTube: React.FC<PlasmaMixTubeProps> = ({ mixValue, signalIntensity = 0.8 }) => {
    // Calculate heights as percentages
    const topHeight = mixValue * 100;
    const bottomHeight = (1 - mixValue) * 100;

    // Determine if spark gap is active (45% - 55%)
    const isSparking = mixValue >= 0.45 && mixValue <= 0.55;

    // Calculate spark gap position (from top)
    const sparkTop = `${mixValue * 100}%`;

    return (
        <div className="plasma-tube-container">
            {/* Top Gas (Source B - Cyan) */}
            <div
                className="plasma-gas-top"
                style={{ height: `${topHeight}%` }}
            />

            {/* Bottom Gas (Source A - Orange) */}
            <div
                className="plasma-gas-bottom"
                style={{ height: `${bottomHeight}%` }}
            />

            {/* Spark Gap */}
            <div
                className={`spark-gap ${isSparking ? 'active' : ''}`}
                style={{ top: sparkTop }}
            />

            {/* Core Beam (always present for structure) */}
            <div className="plasma-core" style={{ opacity: signalIntensity }} />
        </div>
    );
};
