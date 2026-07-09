// Web Audio API Synthesizer for Celebratory Sound Effects

class CelebrationAudio {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a beautiful academic chime/fanfare
  playFanfare() {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Use triangle or sine for warm chime sounds
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        // Envelope
        gainNode.gain.setValueAtTime(0, now + idx * 0.08);
        gainNode.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
    } catch (e) {
      console.warn("Failed to play fanfare sound:", e);
    }
  }

  // Play a soft sweet pop for confetti
  playPop() {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn("Failed to play pop sound:", e);
    }
  }

  // Play a cheering applause sound effect (synthesized with white noise impulses)
  playApplause() {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds of applause
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate random white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Create noise source
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter to shape noise (make it sound more like claps)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 1.2;

      // Volume envelope
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      // Low frequency oscillator (LFO) to modulate volume, giving "pulsing" clapping feel
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 8; // 8 claps per second
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.05;

      lfo.connect(lfoGain);
      // Connect LFO modulation to gain
      lfoGain.connect(gainNode.gain);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      lfo.start(now);
      noise.start(now);
      
      lfo.stop(now + 1.5);
      noise.stop(now + 1.5);
    } catch (e) {
      console.warn("Failed to play applause sound:", e);
    }
  }
}

export const sound = new CelebrationAudio();
