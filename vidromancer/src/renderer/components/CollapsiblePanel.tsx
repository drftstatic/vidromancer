import React, { useState, useEffect } from 'react';
import './CollapsiblePanel.css';

interface CollapsiblePanelProps {
    title: string;
    icon?: string;
    defaultExpanded?: boolean;
    storageKey?: string; // For persisting state to localStorage
    children: React.ReactNode;
    headerRight?: React.ReactNode; // Optional content on right side of header
    className?: string;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
    title,
    icon,
    defaultExpanded = true,
    storageKey,
    children,
    headerRight,
    className = '',
}) => {
    // Load initial state from localStorage if storageKey provided
    const [isExpanded, setIsExpanded] = useState(() => {
        if (storageKey) {
            const saved = localStorage.getItem(`panel-${storageKey}`);
            if (saved !== null) {
                return saved === 'true';
            }
        }
        return defaultExpanded;
    });

    // Save state to localStorage when it changes
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(`panel-${storageKey}`, String(isExpanded));
        }
    }, [isExpanded, storageKey]);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`collapsible-panel ${isExpanded ? 'expanded' : 'collapsed'} ${className}`}>
            <div className="collapsible-panel-header" onClick={toggleExpanded}>
                <div className="collapsible-panel-title">
                    <span className={`collapse-chevron ${isExpanded ? 'expanded' : ''}`}>▶</span>
                    {icon && <span className="panel-icon">{icon}</span>}
                    <span className="panel-title-text">{title}</span>
                </div>
                <div className="collapsible-panel-header-right">
                    {headerRight}
                    <div className={`led-indicator ${isExpanded ? 'active' : ''}`} />
                </div>
            </div>
            <div className={`collapsible-panel-content ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && children}
            </div>
        </div>
    );
};

export default CollapsiblePanel;
