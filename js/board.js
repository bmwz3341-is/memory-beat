/**
 * Memory Beat — board screen: Simon-Says game logic + rendering.
 *
 * Rules: each round appends one random color to the sequence, plays the
 * whole sequence back (lit pads, timed by difficulty), then waits for the
 * player to repeat it. A full correct repeat advances the level and starts
 * the next round; a wrong tap ends the game.
 *
 * Depends on js/storage.js (difficulty/sound/best) and js/sound.js
 * (per-pad tones), loaded before this file.
 */

(function () {
  'use strict';

  const COLORS = ['blue', 'red', 'green', 'yellow'];

  // Playback timing per difficulty: how long a pad stays lit, and the gap
  // before the next one lights up.
  const TIMING = {
    easy: { lit: 550, gap: 260 },
    normal: { lit: 400, gap: 180 },
    hard: { lit: 280, gap: 110 },
  };

  const state = {
    level: 0,
    score: 0,
    playing: false,
  };

  const el = {
    levelValue: document.getElementById('level-value'),
    scoreValue: document.getElementById('score-value'),
    pads: document.querySelectorAll('.pad'),

    btnPlay: document.getElementById('btn-play'),
    btnReset: document.getElementById('btn-reset'),
    turnCaption: document.getElementById('turn-caption'),

    gameOver: document.getElementById('game-over'),
    finalScore: document.getElementById('final-score'),
    finalBest: document.getElementById('final-best'),
    btnPlayAgain: document.getElementById('btn-play-again'),
  };

  // ---------------------------------------------------------------------
  // Render layer
  // ---------------------------------------------------------------------
  function renderBoard() {
    el.levelValue.textContent = state.level;
    el.scoreValue.textContent = state.score;

    el.btnPlay.disabled = state.playing;
    el.btnPlay.textContent = state.playing ? 'המשחק פעיל…' : 'PLAY';
    el.turnCaption.hidden = !state.playing;
  }

  function renderGameOver(visible, best) {
    el.gameOver.hidden = !visible;
    if (visible) {
      el.finalScore.textContent = state.score;
      el.finalBest.textContent = best;
    }
  }

  function setPadLit(color, lit) {
    el.pads.forEach((pad) => {
      if (pad.dataset.color === color) pad.classList.toggle('is-lit', lit);
    });
  }

  window.MemoryBeatUI = {
    setLevel(n) { state.level = n; renderBoard(); },
    setScore(n) { state.score = n; renderBoard(); },
    setPlaying(isPlaying) { state.playing = isPlaying; renderBoard(); },
    setPadLit,
    showGameOver({ score, best } = {}) {
      if (typeof score === 'number') state.score = score;
      renderBoard();
      renderGameOver(true, best);
    },
    hideGameOver() { renderGameOver(false); },
  };

  // ---------------------------------------------------------------------
  // Game engine
  // ---------------------------------------------------------------------
  let sequence = [];
  let playerIndex = 0;
  let acceptingInput = false;
  let pendingTimers = [];

  function after(ms, fn) {
    const id = window.setTimeout(fn, ms);
    pendingTimers.push(id);
    return id;
  }
  function clearPendingTimers() {
    pendingTimers.forEach(window.clearTimeout);
    pendingTimers = [];
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function flashPad(color, durationMs) {
    setPadLit(color, true);
    after(durationMs || 220, () => setPadLit(color, false));
  }

  function startGame() {
    clearPendingTimers();
    el.pads.forEach((pad) => pad.classList.remove('is-lit'));
    window.MemoryBeatUI.hideGameOver();
    sequence = [];
    window.MemoryBeatUI.setScore(0);
    nextRound();
  }

  function nextRound() {
    sequence.push(randomColor());
    playerIndex = 0;
    acceptingInput = false;
    window.MemoryBeatUI.setLevel(sequence.length);
    window.MemoryBeatUI.setPlaying(true);
    after(500, () => playSequenceStep(0));
  }

  function playSequenceStep(i) {
    if (i >= sequence.length) {
      acceptingInput = true;
      return;
    }
    const { lit, gap } = TIMING[window.MemoryBeatStorage.getDifficulty()];
    const color = sequence[i];
    setPadLit(color, true);
    window.MemoryBeatSound.play(color, lit / 1000);
    after(lit, () => {
      setPadLit(color, false);
      after(gap, () => playSequenceStep(i + 1));
    });
  }

  function onPadTap(color) {
    if (!acceptingInput) {
      flashPad(color); // idle tap: tactile/audio feedback only, no game effect
      window.MemoryBeatSound.play(color, 0.22);
      return;
    }

    flashPad(color);
    window.MemoryBeatSound.play(color, 0.22);

    if (sequence[playerIndex] === color) {
      playerIndex++;
      if (playerIndex === sequence.length) {
        acceptingInput = false;
        window.MemoryBeatUI.setScore(sequence.length * 10);
        after(600, nextRound);
      }
      return;
    }

    // Wrong tap: keep the lit feedback visible briefly before ending, per spec.
    acceptingInput = false;
    after(260, endGame);
  }

  function endGame() {
    clearPendingTimers();
    window.MemoryBeatSound.playError();
    window.MemoryBeatUI.setPlaying(false);
    const best = Math.max(state.score, window.MemoryBeatStorage.getBest());
    window.MemoryBeatStorage.setBest(best);
    window.MemoryBeatUI.showGameOver({ score: state.score, best });
  }

  function resetGame() {
    clearPendingTimers();
    el.pads.forEach((pad) => pad.classList.remove('is-lit'));
    acceptingInput = false;
    sequence = [];
    window.MemoryBeatUI.hideGameOver();
    window.MemoryBeatUI.setPlaying(false);
    window.MemoryBeatUI.setLevel(0);
    window.MemoryBeatUI.setScore(0);
  }

  el.btnPlay.addEventListener('click', startGame);
  el.btnPlayAgain.addEventListener('click', startGame);
  el.btnReset.addEventListener('click', resetGame);

  el.pads.forEach((pad) => {
    pad.addEventListener('click', () => onPadTap(pad.dataset.color));
  });

  renderBoard();
})();
