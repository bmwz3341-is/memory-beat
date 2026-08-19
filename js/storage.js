/**
 * Memory Beat — shared localStorage access, used by board.js and settings.js
 * so both pages agree on the same keys/defaults for sound, difficulty and
 * the best score.
 */

window.MemoryBeatStorage = (function () {
  const KEYS = {
    sound: 'memoryBeat.sound',
    difficulty: 'memoryBeat.difficulty',
    best: 'memoryBeat.best',
    bestLevel: 'memoryBeat.bestLevel',
    bestDuration: 'memoryBeat.bestDuration',
    bestDifficulty: 'memoryBeat.bestDifficulty',
    player: 'memoryBeat.player',
    playerId: 'memoryBeat.playerId',
  };

  function getSound() {
    const v = localStorage.getItem(KEYS.sound);
    return v === null ? true : v === 'true';
  }
  function setSound(on) {
    localStorage.setItem(KEYS.sound, String(on));
  }

  function getDifficulty() {
    const v = localStorage.getItem(KEYS.difficulty);
    return v === 'easy' || v === 'hard' ? v : 'normal';
  }
  function setDifficulty(level) {
    localStorage.setItem(KEYS.difficulty, level);
  }

  function getBest() {
    const v = parseInt(localStorage.getItem(KEYS.best), 10);
    return Number.isFinite(v) ? v : 0;
  }
  function setBest(score) {
    localStorage.setItem(KEYS.best, String(score));
  }

  function getBestLevel() {
    const v = parseInt(localStorage.getItem(KEYS.bestLevel), 10);
    return Number.isFinite(v) ? v : 0;
  }
  function setBestLevel(level) {
    localStorage.setItem(KEYS.bestLevel, String(level));
  }

  function getBestDuration() {
    const v = parseInt(localStorage.getItem(KEYS.bestDuration), 10);
    return Number.isFinite(v) ? v : 0;
  }
  function setBestDuration(durationMs) {
    localStorage.setItem(KEYS.bestDuration, String(durationMs));
  }

  function getBestDifficulty() {
    const v = localStorage.getItem(KEYS.bestDifficulty);
    return v === 'easy' || v === 'hard' ? v : 'normal';
  }
  function setBestDifficulty(level) {
    localStorage.setItem(KEYS.bestDifficulty, level);
  }

  function getPlayer() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEYS.player));
      return parsed && parsed.name && parsed.avatar ? parsed : null;
    } catch {
      return null;
    }
  }
  function setPlayer(player) {
    localStorage.setItem(KEYS.player, JSON.stringify(player));
  }

  // Stable per-device id (no accounts exist), used as the Firestore document
  // id for this player's leaderboard row so repeat saves update it in place
  // instead of creating a new row each time.
  function getPlayerId() {
    let id = localStorage.getItem(KEYS.playerId);
    if (!id) {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `player-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEYS.playerId, id);
    }
    return id;
  }

  return {
    getSound, setSound,
    getDifficulty, setDifficulty,
    getBest, setBest,
    getBestLevel, setBestLevel,
    getBestDuration, setBestDuration,
    getBestDifficulty, setBestDifficulty,
    getPlayer, setPlayer,
    getPlayerId,
  };
})();
