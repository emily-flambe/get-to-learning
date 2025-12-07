/**
 * FlashcardList Component - Compact chip layout with split view
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

  let currentModuleId = null, flashcards = [], editingFlashcardId = null, selectedFlashcardId = null;
  let currentProjectId = null;
  let currentModuleIds = [];

  function renderFlashcardChip(fc) {
    const isSelected = fc.id === selectedFlashcardId;
    const truncatedFront = fc.front.length > 40 ? fc.front.substring(0, 40) + '...' : fc.front;
    return '<div class="fc-chip ' + (isSelected ? 'selected' : '') + '" data-id="' + fc.id + '" ' +
      'onclick="FlashcardList.selectFlashcard(' + fc.id + ')">' +
      '<span class="fc-chip-text">' + escapeHtml(truncatedFront) + '</span></div>';
  }

  function renderDetailPanel() {
    if (selectedFlashcardId === null) return '';
    const fc = flashcards.find(f => f.id === selectedFlashcardId);
    if (!fc) return '';
    return '<div class="fc-detail-panel">' +
      '<div class="fc-detail-header">' +
      '<span class="fc-detail-front">' + escapeHtml(fc.front) + '</span>' +
      '<button class="fc-detail-close" onclick="FlashcardList.closeDetail()">&times;</button></div>' +
      '<div class="fc-detail-back">' + escapeHtml(fc.back) + '</div>' +
      '<div class="fc-detail-actions">' +
      '<button onclick="FlashcardList.editFlashcard(' + fc.id + ')">Edit</button>' +
      '<button onclick="FlashcardList.deleteFlashcard(' + fc.id + ')" class="btn-delete">Delete</button>' +
      '</div></div>';
  }

  function renderFlashcardList() {
    return '<div class="flashcard-section"><div class="section-header">' +
      '<h3>Flashcards (' + flashcards.length + ')</h3><div class="section-actions">' +
      (flashcards.length > 0 ? '<button onclick="FlashcardList.startReview()" class="btn-primary">Start Review</button>' : '') +
      '<button onclick="FlashcardList.showCreateForm()">Add Flashcard</button></div></div>' +
      (editingFlashcardId !== null ? renderFlashcardForm() : '') +
      '<div class="fc-split-layout">' +
      '<div class="fc-chips-panel">' +
      (flashcards.length === 0 ? '<p class="empty-state">No flashcards yet. Create your first one!</p>' :
        flashcards.map(fc => renderFlashcardChip(fc)).join('')) +
      '</div>' +
      '<div class="fc-detail-panel-container">' +
      (selectedFlashcardId === null && flashcards.length > 0 ? '<p class="fc-placeholder">Select a flashcard to view details</p>' : renderDetailPanel()) +
      '</div></div></div>';
  }

  function renderFlashcardForm() {
    const isEditing = editingFlashcardId > 0;
    const flashcard = isEditing ? flashcards.find(fc => fc.id === editingFlashcardId) : { front: '', back: '' };
    const inMultiModuleMode = !isEditing && currentModuleIds.length > 1;
    let moduleDropdown = '';
    if (inMultiModuleMode && window.state && window.state.modules) {
      const filteredModules = window.state.modules.filter(m => currentModuleIds.includes(m.id));
      moduleDropdown = '<div class="form-group"><label for="flashcard-module">Module:</label>' +
        '<select id="flashcard-module" name="module_id" required>' +
        '<option value="">Select module...</option>' +
        filteredModules.map(m => '<option value="' + m.id + '">' + escapeHtml(m.name) + '</option>').join('') +
        '</select></div>';
    }
    return '<div class="flashcard-form"><h4>' + (isEditing ? 'Edit' : 'Create') + ' Flashcard</h4>' +
      '<form onsubmit="FlashcardList.handleSubmit(event); return false;">' +
      moduleDropdown +
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
      selectedFlashcardId = null;
      render();
    } catch (error) {
      showError(error.message);
    }
  }

  async function loadFlashcardsMultiple(projectId, moduleIds) {
    try {
      const modulesParam = moduleIds.length > 0 ? '?modules=' + moduleIds.join(',') : '';
      const response = await fetch(API_BASE + '/projects/' + projectId + '/flashcards' + modulesParam);
      if (!response.ok) throw new Error('Failed to load flashcards');
      flashcards = await response.json();
      currentProjectId = projectId;
      currentModuleIds = moduleIds;
      currentModuleId = null;
      selectedFlashcardId = null;
      render();
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  }

  function selectFlashcard(id) {
    selectedFlashcardId = (selectedFlashcardId === id) ? null : id;
    render();
  }

  function closeDetail() {
    selectedFlashcardId = null;
    render();
  }

  function showCreateForm() { editingFlashcardId = 0; render(); }
  function editFlashcard(id) { editingFlashcardId = id; selectedFlashcardId = null; render(); }
  function cancelForm() { editingFlashcardId = null; render(); }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = { front: formData.get('front').trim(), back: formData.get('back').trim() };
    if (!data.front || !data.back) { showError('Both front and back are required'); return; }
    try {
      const isEditing = editingFlashcardId > 0;
      let targetModuleId = currentModuleId;
      if (!isEditing && currentModuleIds.length > 1) {
        targetModuleId = parseInt(formData.get('module_id'), 10);
        if (!targetModuleId) { showError('Please select a module'); return; }
      }
      const url = isEditing ? API_BASE + '/flashcards/' + editingFlashcardId :
        API_BASE + '/modules/' + targetModuleId + '/flashcards';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(isEditing ? 'Failed to update flashcard' : 'Failed to create flashcard');
      editingFlashcardId = null;
      if (currentProjectId) {
        await loadFlashcardsMultiple(currentProjectId, currentModuleIds);
      } else {
        await loadFlashcards(currentModuleId);
      }
    } catch (error) {
      showError(error.message);
    }
  }

  async function deleteFlashcard(id) {
    const password = prompt('Enter password to delete this flashcard:');
    if (!password) return;
    try {
      const response = await fetch(API_BASE + '/flashcards/' + id, {
        method: 'DELETE',
        headers: { 'X-Delete-Password': password }
      });
      if (!response.ok) throw new Error('Failed to delete flashcard');
      selectedFlashcardId = null;
      if (currentProjectId) {
        await loadFlashcardsMultiple(currentProjectId, currentModuleIds);
      } else {
        await loadFlashcards(currentModuleId);
      }
    } catch (error) {
      showError(error.message);
    }
  }

  function startReview() {
    if (currentProjectId) {
      window.location.hash = '#/projects/' + currentProjectId + '/review';
    } else {
      window.location.href = '/review.html?module=' + currentModuleId;
    }
  }

  function render(containerId) {
    const container = document.getElementById(containerId || 'flashcard-container');
    if (container) container.innerHTML = renderFlashcardList();
  }

  window.FlashcardList = {
    load: loadFlashcards, loadMultiple: loadFlashcardsMultiple, render, selectFlashcard, closeDetail, showCreateForm,
    editFlashcard, deleteFlashcard, cancelForm, handleSubmit,
    startReview, renderHtml: renderFlashcardList
  };
})();
