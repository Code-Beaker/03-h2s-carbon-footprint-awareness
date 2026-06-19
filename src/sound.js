// Dynamic Web Audio API Sound Generator (Zero assets, high performance)
export const SoundManager = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  playClick() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  },

  playTabSwitch() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  },

  playGuitarPluck(index, isChecked) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Pentatonic scale representing bright acoustic guitar strings: C4, D4, E4, G4, A4, C5, D5, E5, G5
    const scale = [
      261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99,
    ];
    const targetFreq = scale[index % scale.length];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Checked is dynamic and bright (triangle); Unchecked is muted and detuned (sawtooth)
    osc.type = isChecked ? "triangle" : "sawtooth";

    // Emulate string tension bending/gliding into pitch on pluck
    if (isChecked) {
      osc.frequency.setValueAtTime(targetFreq * 0.98, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.04);
    } else {
      osc.frequency.setValueAtTime(targetFreq, now);
      osc.frequency.linearRampToValueAtTime(targetFreq * 0.85, now + 0.14);
    }

    // Filter creates the bright pluck decay (Karplus-Strong string emulation)
    filter.type = "lowpass";
    filter.Q.value = 6;
    if (isChecked) {
      filter.frequency.setValueAtTime(targetFreq * 4, now);
      filter.frequency.exponentialRampToValueAtTime(
        targetFreq * 1.2,
        now + 0.18,
      );
    } else {
      filter.frequency.setValueAtTime(targetFreq * 1.5, now);
      filter.frequency.linearRampToValueAtTime(80, now + 0.14);
    }

    // Envelope for sharp pluck and ring-out
    if (isChecked) {
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    } else {
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isChecked ? 0.5 : 0.15));
  },

  playResult(score) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (score < 180) {
      // VERY HAPPY arpeggio (C Major scale sweep up: C4 -> E4 -> G4 -> C5 -> E5 -> G5 -> C6)
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const time = now + index * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.35);
      });
    } else {
      // VERY SAD warning arpeggio (C minor descending chord: C4 -> Ab3 -> F3 -> D3 -> C3)
      const notes = [261.63, 207.65, 174.61, 146.83, 130.81];
      notes.forEach((freq, index) => {
        const time = now + index * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.linearRampToValueAtTime(freq * 0.95, time + 0.45); // sad slide down

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.55);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.55);
      });
    }
  },

  playCongratsChime() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99, 1046.5,
    ];

    notes.forEach((freq, index) => {
      const time = now + index * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, time);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 3, time);
      filter.frequency.exponentialRampToValueAtTime(80, time + 0.8);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 1.2);
    });
  },
};
