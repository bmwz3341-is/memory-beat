/**
 * Memory Beat — profile setup (avatar + name), board screen only.
 * Forced on first visit (no saved player): the modal opens with its close
 * button hidden, so it can only be dismissed by saving. On later visits the
 * profile icon reopens it, pre-filled, with a close button to just cancel.
 */

(function () {
  'use strict';

  const el = {
    profileBtn: document.getElementById('btn-profile'),
    avatarDisplay: document.getElementById('profile-avatar-display'),
    nameDisplay: document.getElementById('profile-name-display'),
    modal: document.getElementById('profile-modal'),
    closeBtn: document.getElementById('profile-modal-close'),
    avatarGrid: document.getElementById('avatar-grid'),
    nameInput: document.getElementById('profile-name-input'),
    saveBtn: document.getElementById('profile-save'),
  };

  let selectedAvatar = null;

  function renderProfileButton() {
    const player = window.MemoryBeatStorage.getPlayer();
    el.avatarDisplay.textContent = player ? player.avatar : '👤';
    el.nameDisplay.textContent = player ? player.name : '';
  }

  function updateSaveEnabled() {
    el.saveBtn.disabled = !(selectedAvatar && el.nameInput.value.trim());
  }

  function openModal(forced) {
    const player = window.MemoryBeatStorage.getPlayer();
    selectedAvatar = player ? player.avatar : null;
    el.nameInput.value = player ? player.name : '';
    el.avatarGrid.querySelectorAll('.avatar-option').forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.avatar === selectedAvatar);
    });
    el.closeBtn.hidden = forced;
    updateSaveEnabled();
    el.modal.hidden = false;
  }

  function closeModal() {
    el.modal.hidden = true;
  }

  el.avatarGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.avatar-option');
    if (!btn) return;
    selectedAvatar = btn.dataset.avatar;
    el.avatarGrid.querySelectorAll('.avatar-option').forEach((b) => b.classList.toggle('is-selected', b === btn));
    updateSaveEnabled();
  });

  el.nameInput.addEventListener('input', updateSaveEnabled);

  el.saveBtn.addEventListener('click', () => {
    const name = el.nameInput.value.trim();
    if (!name || !selectedAvatar) return;
    window.MemoryBeatStorage.setPlayer({ name, avatar: selectedAvatar });
    renderProfileButton();
    closeModal();
  });

  el.profileBtn.addEventListener('click', () => openModal(false));
  el.closeBtn.addEventListener('click', closeModal);

  renderProfileButton();
  if (!window.MemoryBeatStorage.getPlayer()) {
    openModal(true);
  }
})();
