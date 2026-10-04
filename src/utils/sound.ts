/**
 * Web Audio API procedural sound synthesizer.
 * Generates clean, Apple-like chimes and tactile sound effects without external audio assets.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isEnabled = true;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.isEnabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Crisp, soft checkmark 'pop/click' sound when completing a task or subtask
   */
  public playCheck() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch envelope: quick rising chirp
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio check sound failed', e);
    }
  }

  /**
   * Subtle uncheck sound
   */
  public playUncheck() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio uncheck sound failed', e);
    }
  }

  /**
   * Harmonious chime for task reminders & notifications
   */
  public playReminder() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.45);
      });
    } catch (e) {
      console.warn('Audio reminder sound failed', e);
    }
  }

  /**
   * Celebratory completion fanfare when all tasks in a topic are done
   */
  public playCelebration() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0 },
        { freqs: [587.33, 739.99, 880.00], time: 0.12 },
        { freqs: [659.25, 830.61, 987.77], time: 0.24 },
        { freqs: [1046.50, 1318.51, 1567.98], time: 0.38 }
      ];

      chords.forEach(({ freqs, time }) => {
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(0, now + time);
          gain.gain.linearRampToValueAtTime(0.08, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + 0.55);
        });
      });
    } catch (e) {
      console.warn('Audio celebration sound failed', e);
    }
  }
}

export const soundManager = new SoundController();
