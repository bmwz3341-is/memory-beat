/**
 * Memory Beat — Web Audio beeps for the four pads, one distinct tone each.
 * Respects the sound on/off setting stored via MemoryBeatStorage.
 */

window.MemoryBeatSound = (function () {
  // blue was 329.63 (E4) — too close to red's range and weak on small
  // speakers, so it reads as quiet. Raised to a brighter, more present pitch.
  const FREQ = { blue: 440.0, red: 261.63, green: 392.0, yellow: 523.25 };
  const PEAK_GAIN = { blue: 0.4 };

  let ctx;
  function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(frequency, type, durationSec, peakGain) {
    if (!window.MemoryBeatStorage.getSound()) return;
    const audioCtx = ensureContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;

    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain || 0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  function play(color, durationSec) {
    tone(FREQ[color] || 440, 'sine', durationSec || 0.28, PEAK_GAIN[color]);
  }

  function playError() {
    tone(110, 'sawtooth', 0.5);
  }

  return { play, playError };
})();
