import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, Zap, Layers, Music, AlertTriangle, ChevronRight } from 'lucide-react';
import './App.css';

function App() {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('robb@fladrycreative.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="w-full py-6 z-10 glass sticky top-0">
        <div className="container flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter">
            <span className="text-white">DIGITAL</span>
            <span className="gradient-text ml-2">VIDEOMANCER</span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <a href="#features" className="text-sm font-medium hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium hover:text-white transition-colors">About</a>
            <a href="#download" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-white/10">
              Get Beta
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-6 uppercase tracking-wider">
            <Zap size={12} /> Public Beta v0.1
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Unleash Your <br />
            <span className="gradient-text">Video Sorcery</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            A digital recreation of the legendary video synthesis hardware.
            Experiment with modular effects, glitch art, and visual synthesis right from your desktop.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#download" className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-transform hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                Download Now <Download size={18} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
            <a href="#about" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full font-medium transition-all flex items-center gap-2">
              Learn More <ChevronRight size={18} />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-black/20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Modular Engine</h3>
              <p className="text-gray-400">Stack and route effects in any order. Create complex visual chains limited only by your imagination.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Music className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">MIDI Integration</h3>
              <p className="text-gray-400">Map any parameter to your MIDI controller. Perform your visuals live in sync with the music.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Processing</h3>
              <p className="text-gray-400">Low-latency video processing designed for live performance and experimentation.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About / Disclaimer */}
      <section id="about" className="py-20">
        <div className="container max-w-3xl">
          <div className="p-8 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex gap-6 items-start">
            <AlertTriangle className="text-orange-400 shrink-0 mt-1" size={32} />
            <div>
              <h3 className="text-xl font-bold mb-3 text-orange-200">Experimental Software</h3>
              <p className="text-gray-400 mb-4">
                Digital Videomancer is currently a <strong>proof of concept</strong>. It is free to use but expect bugs, incomplete features, and rough edges.
                Everything is still in the "baking" phase.
              </p>
              <p className="text-gray-400">
                We are releasing this beta to gather feedback and see what artists can create with these tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 pointer-events-none" />
        <div className="container text-center relative z-10">
          <h2 className="text-4xl font-bold mb-8">Ready to Experiment?</h2>
          <div className="flex flex-col items-center gap-6">
            <button className="px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Download for macOS (Universal)
            </button>
            <p className="text-sm text-gray-500">Version 0.1.0-beta • macOS 11.0+</p>
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg mb-2">Digital Videomancer</h4>
            <p className="text-gray-500 text-sm">A Fladry Creative Experiment</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-gray-400 text-sm">Have feedback or found a bug?</p>
            <button
              onClick={copyEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-sm"
            >
              <Mail size={16} />
              {emailCopied ? 'Email Copied!' : 'robb@fladrycreative.com'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
