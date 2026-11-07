/**
 * DIWALI BLAST 2026 - PROCEDURAL WEB AUDIO SYNTHESIZER
 * 100% synthesized festive sound effects and ambient soundscapes.
 * No external mp3 files required. Zero broken links. Low latency.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.isMuted = true; // Disabled initially as per requirements
    this.isInitialized = false;
    this.ambientOscillators = [];
    this.ambientInterval = null;
    this.volume = 0.85;

    // Load saved mute preference from localStorage if available
    try {
      const savedMute = localStorage.getItem('diwali_blast_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch (e) {
      // Ignore localStorage restrictions if any
    }
  }

  /**
   * Initializes the Web Audio Context upon user interaction
   */
  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported on this browser.');
        return;
      }

      this.ctx = new AudioContextClass();

      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Dedicated Ambient Sound Gain Node
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.isInitialized = true;

      // Start ambient festive drone if unmuted
      if (!this.isMuted) {
        this.startAmbient();
      }
    } catch (err) {
      console.warn('Failed to initialize AudioContext:', err);
    }
  }

  /**
   * Toggles mute state
   * @returns {boolean} New muted state
   */
  toggleMute() {
    if (!this.isInitialized) {
      this.init();
      this.isMuted = false;
    } else {
      this.isMuted = !this.isMuted;
    }

    try {
      localStorage.setItem('diwali_blast_muted', String(this.isMuted));
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
    }

    if (!this.isMuted) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.startAmbient();
    } else {
      this.stopAmbient();
    }

    return this.isMuted;
  }

  /**
   * Explicitly set mute
   */
  setMute(mute) {
    if (this.isMuted !== mute) {
      this.toggleMute();
    }
  }

  /**
   * Helper: Create a buffer filled with white noise
   */
  createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * 1. Rocket Launch Whoosh & Whistle
   * Rising frequency oscillator combined with bandpass-filtered noise
   * @param {number} pan Stereo pan between -1.0 (left) and 1.0 (right)
   */
  playRocketLaunch(pan = 0) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // Stereo panner
      let pannerNode = null;
      if (this.ctx.createStereoPanner) {
        pannerNode = this.ctx.createStereoPanner();
        pannerNode.pan.setValueAtTime(Math.max(-0.9, Math.min(0.9, pan)), now);
        pannerNode.connect(this.masterGain);
      }
      const targetNode = pannerNode || this.masterGain;

      // 1. Whistle Oscillator (High rising sine/saw wave)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280 + Math.random() * 60, now);
      osc.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 300, now + 0.85);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(oscGain);
      oscGain.connect(targetNode);

      osc.start(now);
      osc.stop(now + 0.95);

      // 2. Whoosh Thruster Noise (Filtered noise hiss)
      const noiseBuffer = this.createNoiseBuffer(0.9);
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.8);
        filter.Q.value = 2.5;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.2);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(targetNode);

        noise.start(now);
        noise.stop(now + 0.9);
      }
    } catch (e) {
      // Audio fallback fail-safe
    }
  }

  /**
   * 2. Firework Explosion Sound
   * Deep low-frequency sub-bass boom, punchy impact, and trailing rumble
   * @param {Object} options Explosion characteristics
   */
  playExplosion(options = {}) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const sizeMultiplier = options.size || 1.0;
      const pan = options.pan || 0;

      // Stereo panner
      let pannerNode = null;
      if (this.ctx.createStereoPanner) {
        pannerNode = this.ctx.createStereoPanner();
        pannerNode.pan.setValueAtTime(Math.max(-0.9, Math.min(0.9, pan)), now);
        pannerNode.connect(this.masterGain);
      }
      const targetNode = pannerNode || this.masterGain;

      // A. Sub-bass boom (sine wave pitch sweep downwards)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      const startFreq = 120 * sizeMultiplier;
      subOsc.frequency.setValueAtTime(startFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.6 * sizeMultiplier);

      const maxSubGain = Math.min(0.7, 0.45 * sizeMultiplier);
      subGain.gain.setValueAtTime(maxSubGain, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7 * sizeMultiplier);

      subOsc.connect(subGain);
      subGain.connect(targetNode);

      subOsc.start(now);
      subOsc.stop(now + 0.75 * sizeMultiplier);

      // B. Explosive blast noise burst
      const noiseBuffer = this.createNoiseBuffer(1.2);
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 * sizeMultiplier, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.9 * sizeMultiplier);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5 * sizeMultiplier, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9 * sizeMultiplier);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(targetNode);

        noise.start(now);
        noise.stop(now + 1.0 * sizeMultiplier);
      }

      // C. Optional trailing crackles (dragon eggs / chrysanthemum)
      if (options.crackles) {
        setTimeout(() => {
          this.playCrackle({ count: 8 + Math.floor(Math.random() * 8) });
        }, 320 + Math.random() * 150);
      }
    } catch (e) {}
  }

  /**
   * 3. Bomb Blast Sound (Cartoon / Lakshmi Bomb)
   * Devastating high-impact acoustic shockwave with intense bass thud and long rumble
   */
  playBombBlast() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Initial High-Velocity Crack / Transient
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(350, now);
      clickOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      clickGain.gain.setValueAtTime(0.8, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickOsc.start(now);
      clickOsc.stop(now + 0.1);

      // 2. Heavy Sub-Bass Shockwave (35Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

      subGain.gain.setValueAtTime(0.85, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 1.5);

      // 3. Shrapnel & Debris Noise Rumble
      const noiseBuffer = this.createNoiseBuffer(1.6);
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 1.4);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 1.6);
      }
    } catch (e) {}
  }

  /**
   * 4. Bomb Fuse Burning Sizzle
   */
  playFuseSizzle(duration = 2.0) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(duration);
      if (!noiseBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      // Pulsing sizzle envelope
      for (let t = 0; t < duration; t += 0.1) {
        gain.gain.setValueAtTime(0.08 + Math.random() * 0.1, now + t);
      }
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {}
  }

  /**
   * 5. Anar (Flower Pot) Continuous Fountain Sound
   * Sustained rushing, hissing spray with periodic crackling pops
   */
  playAnarFountain(duration = 6.0) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(duration);
      if (!noiseBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.value = 1.2;

      // Swelling jet sound
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.6); // Build-up
      gain.gain.setValueAtTime(0.28, now + duration - 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Fade out

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + duration);

      // Micro crackle bursts during peak fountain
      const interval = setInterval(() => {
        if (this.isMuted) {
          clearInterval(interval);
          return;
        }
        this.playCrackle({ count: 3 + Math.floor(Math.random() * 4), volume: 0.1 });
      }, 350);

      setTimeout(() => clearInterval(interval), (duration - 0.8) * 1000);
    } catch (e) {}
  }

  /**
   * 6. Sparkler (Phuljhadi) Crackling & Sizzle
   */
  playSparkler(duration = 0.25) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const noiseBuffer = this.createNoiseBuffer(duration);
      if (!noiseBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200 + Math.random() * 1000, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {}
  }

  /**
   * 7. Staggered Crackles ("Dragon Eggs" / Chrysanthemum burst pops)
   */
  playCrackle(options = {}) {
    if (this.isMuted || !this.ctx) return;
    try {
      const count = options.count || 6;
      const vol = options.volume || 0.16;

      for (let i = 0; i < count; i++) {
        const delay = Math.random() * 0.35;
        setTimeout(() => {
          if (this.isMuted || !this.ctx) return;
          const now = this.ctx.currentTime;

          const buffer = this.createNoiseBuffer(0.05);
          if (!buffer) return;

          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1800 + Math.random() * 2400, now);
          filter.Q.value = 5.0;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(vol * (0.6 + Math.random() * 0.6), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          noise.start(now);
          noise.stop(now + 0.05);
        }, delay * 1000);
      }
    } catch (e) {}
  }

  /**
   * 8. Traditional Bell Chime (for Diya click interaction)
   */
  playBellChime() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // High pure harmonic frequencies for Indian brass temple bell / ghanti
      const frequencies = [880, 1760, 2640, 3520];
      const gains = [0.2, 0.1, 0.05, 0.02];

      frequencies.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 2.0);
      });
    } catch (e) {}
  }

  /**
   * 9. Ambient Festive Drone & Ethereal Bells
   * Soothing, meditative Indian pentatonic harmony (Sa - Pa - Dha / C, G, A, C)
   * Warm tanpura-style drone with soft intermittent crystal chimes.
   */
  startAmbient() {
    if (this.isMuted || !this.ctx || this.ambientOscillators.length > 0) return;
    try {
      const now = this.ctx.currentTime;

      // Base drone chord: C3 (130.81Hz), G3 (196.00Hz), C4 (261.63Hz)
      const droneNotes = [130.81, 196.00, 261.63];

      droneNotes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Lowpass warm harmonic filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 3.0); // Gentle 3s fade-in

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(now);
        this.ambientOscillators.push({ osc, gain });
      });

      // Periodic gentle celestial chime (pentatonic scale notes)
      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
      this.ambientInterval = setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const chimeFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const chimeTime = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(chimeFreq, chimeTime);

        gain.gain.setValueAtTime(0.001, chimeTime);
        gain.gain.linearRampToValueAtTime(0.04, chimeTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 2.5);

        osc.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(chimeTime);
        osc.stop(chimeTime + 2.6);
      }, 3500);

    } catch (e) {}
  }

  /**
   * Stop ambient sound
   */
  stopAmbient() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }

    if (this.ambientOscillators.length > 0 && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientOscillators.forEach(({ osc, gain }) => {
        try {
          gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
          setTimeout(() => {
            try { osc.stop(); } catch (err) {}
          }, 600);
        } catch (e) {}
      });
      this.ambientOscillators = [];
    }
  }
}

// Export singleton instance
export const soundManager = new SoundEngine();

