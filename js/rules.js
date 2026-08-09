/**
 * Memory Beat — scoring rules explainer modal, opened from the "?" icon
 * next to the level label. That icon is only shown while a game is in
 * progress (toggled by js/board.js); this file just wires the modal itself.
 */

(function () {
  'use strict';

  const el = {
    btnRules: document.getElementById('btn-rules'),
    modal: document.getElementById('rules-modal'),
    closeBtn: document.getElementById('rules-modal-close'),
  };

  el.btnRules.addEventListener('click', () => { el.modal.hidden = false; });
  el.closeBtn.addEventListener('click', () => { el.modal.hidden = true; });
})();
