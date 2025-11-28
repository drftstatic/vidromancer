import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Mail, Layers, Music, Zap, Terminal, ArrowDown, ExternalLink, Circle } from 'lucide-react';
import './App.css';

function App() {
  const [emailCopied, setEmailCopied] = useState(false);
  const [time, setTime] = useState(new Date());
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText('robb@fladrycreative.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="app">
      {/* Animated background gradients */}
      <div className="bg-layer">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner container">
          <div className="nav-brand">
            <span className="brand-text">VIDROMANCER</span>
            <span className="brand-version">v0.1.0</span>
          </div>
          <div className="nav-status">
            <Circle size={8} className="status-dot" />
            <span className="status-text">SIGNAL ACTIVE</span>
            <span className="status-time">{formatTime(time)}</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">MODULES</a>
            <a href="#download" className="nav-link">DOWNLOAD</a>
            <a href="#about" className="nav-link nav-link-highlight">
              <Terminal size={14} />
              BETA
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section className="hero" style={{ opacity: heroOpacity, scale: heroScale }}>
        <div className="hero-content container">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="badge-dot" />
            PUBLIC BETA // FREE DOWNLOAD
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="title-line">VIDEO</span>
            <span className="title-line title-accent" data-text="SYNTHESIS">SYNTHESIS</span>
            <span className="title-line">REBORN</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            A digital recreation of legendary analog video synthesis hardware.
            <br />
            Modular effects. Glitch art. Visual alchemy.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <a href="#download" className="btn btn-primary">
              <Download size={18} />
              DOWNLOAD FOR MAC
            </a>
            <a href="#features" className="btn btn-ghost">
              EXPLORE FEATURES
              <ArrowDown size={18} />
            </a>
          </motion.div>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="stat">
              <span className="stat-value">60</span>
              <span className="stat-label">FPS REALTIME</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">∞</span>
              <span className="stat-label">EFFECT CHAINS</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">MIDI</span>
              <span className="stat-label">FULL SUPPORT</span>
            </div>
          </motion.div>
        </div>

        <div className="hero-scroll-indicator">
          <ArrowDown size={20} />
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-tag">// SYSTEM MODULES</span>
            <h2 className="section-title">Core Architecture</h2>
          </motion.div>

          <div className="features-grid">
            <motion.div
              className="feature-card feature-card-large"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="feature-header">
                <div className="feature-icon feature-icon-red">
                  <Layers size={24} />
                </div>
                <span className="feature-tag">CORE</span>
              </div>
              <h3 className="feature-title">Modular Signal Chain</h3>
              <p className="feature-description">
                Stack effects in any order. Route video signals through color processors,
                pattern generators, feedback loops, and glitch modules. The order matters—experiment
                with different chains to discover unique visual textures.
              </p>
              <div className="feature-preview">
                <div className="signal-flow">
                  <span className="signal-node">INPUT</span>
                  <span className="signal-arrow">→</span>
                  <span className="signal-node signal-active">COLORIZE</span>
                  <span className="signal-arrow">→</span>
                  <span className="signal-node">FEEDBACK</span>
                  <span className="signal-arrow">→</span>
                  <span className="signal-node">OUTPUT</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="feature-header">
                <div className="feature-icon feature-icon-cyan">
                  <Music size={24} />
                </div>
                <span className="feature-tag">CONTROL</span>
              </div>
              <h3 className="feature-title">MIDI Mapping</h3>
              <p className="feature-description">
                Connect any MIDI controller. Map knobs, faders, and buttons to effect parameters.
                Perform your visuals live, in sync with audio.
              </p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="feature-header">
                <div className="feature-icon feature-icon-green">
                  <Zap size={24} />
                </div>
                <span className="feature-tag">PERFORMANCE</span>
              </div>
              <h3 className="feature-title">Real-time Engine</h3>
              <p className="feature-description">
                GPU-accelerated processing delivers smooth 60fps output. Designed for live
                performance with minimal latency between input and display.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="download">
        <div className="container">
          <motion.div
            className="download-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="download-content">
              <span className="section-tag">// ACQUIRE</span>
              <h2 className="download-title">Ready to Experiment?</h2>
              <p className="download-description">
                Download the public beta and start creating.
                Free to use during beta period.
              </p>

              <div className="download-actions">
                <button className="btn btn-download">
                  <Download size={20} />
                  <div className="btn-text">
                    <span className="btn-label">Download for macOS</span>
                    <span className="btn-meta">Universal Binary • v0.1.0-beta</span>
                  </div>
                </button>
              </div>

              <div className="download-requirements">
                <span className="req-label">REQUIREMENTS:</span>
                <span className="req-item">macOS 11.0+</span>
                <span className="req-divider">•</span>
                <span className="req-item">Apple Silicon or Intel</span>
                <span className="req-divider">•</span>
                <span className="req-item">Metal GPU</span>
              </div>
            </div>

            <div className="download-visual">
              <div className="terminal-window">
                <div className="terminal-header">
                  <span className="terminal-dot terminal-dot-red" />
                  <span className="terminal-dot terminal-dot-yellow" />
                  <span className="terminal-dot terminal-dot-green" />
                  <span className="terminal-title">vidromancer.app</span>
                </div>
                <div className="terminal-body">
                  <code className="terminal-line">
                    <span className="terminal-prompt">$</span> vidromancer --init
                  </code>
                  <code className="terminal-line terminal-output">
                    [INFO] Loading video synthesis engine...
                  </code>
                  <code className="terminal-line terminal-output">
                    [INFO] Initializing effect modules...
                  </code>
                  <code className="terminal-line terminal-output terminal-success">
                    [OK] System ready. Signal routing active.
                  </code>
                  <code className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-cursor">_</span>
                  </code>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About / Warning Section */}
      <section id="about" className="about">
        <div className="container">
          <motion.div
            className="warning-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="warning-icon">
              <span className="warning-symbol">!</span>
            </div>
            <div className="warning-content">
              <h3 className="warning-title">Experimental Software</h3>
              <p className="warning-text">
                Vidromancer is a <strong>proof of concept</strong>. Expect bugs, incomplete features,
                and rough edges. We're releasing this beta to gather feedback and see what
                artists can create with these tools. Everything is still in the "baking" phase.
              </p>
              <p className="warning-text">
                Your feedback shapes the future of this project.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">VIDROMANCER</span>
              <span className="footer-tagline">A Fladry Creative Experiment</span>
            </div>

            <div className="footer-contact">
              <span className="footer-label">FEEDBACK / BUGS</span>
              <button onClick={copyEmail} className="footer-email">
                <Mail size={16} />
                {emailCopied ? 'COPIED!' : 'robb@fladrycreative.com'}
              </button>
            </div>

            <div className="footer-links">
              <a href="https://fladrycreative.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                Fladry Creative <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">2025 Fladry Creative. All rights reserved.</span>
            <span className="footer-signal">
              <Circle size={6} className="signal-indicator" />
              END TRANSMISSION
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
