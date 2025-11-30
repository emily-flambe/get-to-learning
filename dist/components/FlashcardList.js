/**
 * FlashcardList Component - Manages flashcard CRUD operations
 */
(function() {
  'use strict';
  const API_BASE = '/api';
  
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
  
  let currentModuleId = null, flashcards = [], editingFlashcardId = null;
  
  function renderFlashcard(fc) {
    const isFlipped = fc._flipped || false;
    return '<div class="flashcard ' + (isFlipped ? 'flipped' : '') + '" data-id="' + fc.id + '">' +
      '<div class="flashcard-content" onclick="FlashcardList.toggleFlashcard(' + fc.id + ')">' +
      '<div class="flashcard-front"><div class="flashcard-label">Front:</div>' +
      '<div class="flashcard-text">' + escapeHtml(fc.front) + '</div></div>' +
      '<div class="flashcard-back ' + (isFlipped ? '' : 'hidden') + '"><div class="flashcard-label">Back:</div>' +
      '<div class="flashcard-text">' + escapeHtml(fc.back) + '</div></div></div>' +
      '<div class="flashcard-actions">' +
      '<button onclick="event.stopPropagation(); FlashcardList.editFlashcard(' + fc.id + ')">Edit</button>' +
      '<button onclick="event.stopPropagation(); FlashcardList.deleteFlashcard(' + fc.id + ')" class="btn-delete">Delete</button>' +
      '</div></div>';
  }
  
  function renderFlashcardList() {
    return '<div class="flashcard-section"><div class="section-header">' +
      '<h3>Flashcards (' + flashcards.length + ')</h3><div class="section-actions">' +
      (flashcards.length > 0 ? '<button onclick="FlashcardList.startReview()" class="btn-primary">Start Review</button>' : '') +
      '<button onclick="FlashcardList.showCreateForm()">Add Flashcard</button></div></div>' +
      (editingFlashcardId !== null ? renderFlashcardForm() : '') +
      '<div class="flashcard-list">' +
      (flashcards.length === 0 ? '<p class="empty-state">No flashcards yet. Create your first one!</p>' :
        flashcards.map(fc => renderFlashcard(fc)).join('')) +
      '</div></div>';
  }
  
  function renderFlashcardForm() {
    const isEditing = editingFlashcardId > 0;
    const flashcard = isEditing ? flashcards.find(fc => fc.id === editingFlashcardId) : { front: '', back: '' };
    return '<div class="flashcard-form"><h4>' + (isEditing ? 'Edit' : 'Create') + ' Flashcard</h4>' +
      '<form onsubmit="FlashcardList.handleSubmit(event); return false;">' +
      '<div class="form-group"><label for="flashcard-front">Front (Question):</label>' +
      '<textarea id="flashcard-front" name="front" required rows="3" placeholder="Enter the question or prompt...">' +
      (isEditing ? escapeHtml(flashcard.front) : '') + '</textarea></div>' +
      '<div class="form-group"><label for="flashcard-back">Back (Answer):</label>' +
      '<textarea id="flashcard-back" name="back" required rows="3" placeholder="Enter the answer...">' +
      (isEditing ? escapeHtml(flashcard.back) : '') + '</textarea></div>' +
      '<div class="form-actions"><button type="submit" class="btn-primary">' + (isEditing ? 'Update' : 'Create') + '</button>' +
      '<button type="button" onclick="FlashcardList.cancelForm()">Cancel</button></div></form></div>';
  }
  
  async function loadFlashcards(moduleId) {
    try {
      const response = await fetch(API_BASE + '/modules/' + moduleId + '/flashcards');
      if (!response.ok) throw new Error('Failed to load flashcards');
      flashcards = await response.json();
      currentModuleId = moduleId;
      render();
    } catch (error) {
      showError(error.message);
    }
  }
  
  function toggleFlashcard(id) {
    const flashcard = flashcards.find(fc => fc.id === id);
    if (flashcard) {
      flashcard._flipped = !flashcard._flipped;
      render();
    }
  }
  
  function showCreateForm() { editingFlashcardId = 0; render(); }
  function editFlashcard(id) { editingFlashcardId = id; render(); }
  function cancelForm() { editingFlashcardId = null; render(); }
  
  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = { front: formData.get('front').trim(), back: formData.get('back').trim() };
    if (!data.front || !data.back) { showError('Both front and back are required'); return; }
    try {
      const isEditing = editingFlashcardId > 0;
      const url = isEditing ? API_BASE + '/flashcards/' + editingFlashcardId :
        API_BASE + '/modules/' + currentModuleId + '/flashcards';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(isEditing ? 'Failed to update flashcard' : 'Failed to create flashcard');
      editingFlashcardId = null;
      await loadFlashcards(currentModuleId);
    } catch (error) {
      showError(error.message);
    }
  }
  
  async function deleteFlashcard(id) {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;
    try {
      const response = await fetch(API_BASE + '/flashcards/' + id, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete flashcard');
      await loadFlashcards(currentModuleId);
    } catch (error) {
      showError(error.message);
    }
  }
  
  function startReview() {
    if (window.ReviewMode) window.ReviewMode.start(currentModuleId, flashcards);
  }
  
  function render(containerId) {
    const container = document.getElementById(containerId || 'flashcard-container');
    if (container) container.innerHTML = renderFlashcardList();
  }
  
  window.FlashcardList = {
    load: loadFlashcards, render, toggleFlashcard, showCreateForm,
    editFlashcard, deleteFlashcard, cancelForm, handleSubmit,
    startReview, renderHtml: renderFlashcardList
  };
})();
