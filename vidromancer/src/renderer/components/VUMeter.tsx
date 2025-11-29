import React, { useEffect, useRef } from 'react';
import './VUMeter.css';

interface VUMeterProps {
    leftLevel: number;  // 0-1
    rightLevel: number; // 0-1
    peakLevel: number;  // 0-1
    stereo?: boolean;
}

export const VUMeter: React.FC<VUMeterProps> = ({
    leftLevel,
    rightLevel,
    peakLevel,
    stereo = true
}) => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const peakLeftRef = useRef<HTMLDivElement>(null);
    const peakRightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (leftRef.current) {
            leftRef.current.style.height = `${Math.min(100, leftLevel * 100)}%`;
        }
        if (rightRef.current) {
            rightRef.current.style.height = `${Math.min(100, rightLevel * 100)}%`;
        }
        if (peakLeftRef.current) {
            peakLeftRef.current.style.bottom = `${Math.min(100, peakLevel * 100)}%`;
        }
        if (peakRightRef.current) {
            peakRightRef.current.style.bottom = `${Math.min(100, peakLevel * 100)}%`;
        }
    }, [leftLevel, rightLevel, peakLevel]);

    // Calculate segment states for LED-style meter
    const getSegmentStates = (level: number): boolean[] => {
        const segments = 12;
        const activeCount = Math.floor(level * segments);
        return Array(segments).fill(false).map((_, i) => i < activeCount);
    };

    const leftSegments = getSegmentStates(leftLevel);
    const rightSegments = getSegmentStates(rightLevel);
    const peakSegment = Math.floor(peakLevel * 12);

    return (
        <div className={`vu-meter-container ${stereo ? 'stereo' : 'mono'}`}>
            {/* Scale markings */}
            <div className="vu-scale">
                <span className="vu-scale-mark" data-db="0">0</span>
                <span className="vu-scale-mark" data-db="-6">-6</span>
                <span className="vu-scale-mark" data-db="-12">-12</span>
                <span className="vu-scale-mark" data-db="-24">-24</span>
                <span className="vu-scale-mark" data-db="-48">-48</span>
            </div>

            {/* Left channel */}
            <div className="vu-channel">
                <div className="vu-segments">
                    {leftSegments.map((active, i) => (
                        <div
                            key={i}
                            className={`vu-segment ${active ? 'active' : ''} ${i === peakSegment ? 'peak' : ''}`}
                            data-level={i}
                        />
                    ))}
                </div>
                <span className="vu-channel-label">L</span>
            </div>

            {/* Right channel (if stereo) */}
            {stereo && (
                <div className="vu-channel">
                    <div className="vu-segments">
                        {rightSegments.map((active, i) => (
                            <div
                                key={i}
                                className={`vu-segment ${active ? 'active' : ''} ${i === peakSegment ? 'peak' : ''}`}
                                data-level={i}
                            />
                        ))}
                    </div>
                    <span className="vu-channel-label">R</span>
                </div>
            )}
        </div>
    );
};

// Compact horizontal VU for inline use
interface CompactVUProps {
    level: number;
    width?: number;
}

export const CompactVU: React.FC<CompactVUProps> = ({ level, width = 60 }) => {
    return (
        <div className="compact-vu" style={{ width }}>
            <div
                className="compact-vu-fill"
                style={{ width: `${Math.min(100, level * 100)}%` }}
            />
        </div>
    );
};
