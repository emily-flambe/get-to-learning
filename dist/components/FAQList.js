/**
 * FAQList Component - Manages FAQ CRUD operations
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
  
  let currentModuleId = null, faqs = [], editingFaqId = null;
  
  function renderFaq(faq) {
    const isExpanded = faq._expanded || false;
    return '<div class="faq-item ' + (isExpanded ? 'expanded' : '') + '" data-id="' + faq.id + '">' +
      '<div class="faq-question" onclick="FAQList.toggleFaq(' + faq.id + ')">' +
      '<span class="faq-icon">' + (isExpanded ? '▼' : '▶') + '</span>' +
      '<span class="faq-question-text">' + escapeHtml(faq.question) + '</span></div>' +
      '<div class="faq-answer ' + (isExpanded ? '' : 'hidden') + '">' +
      '<div class="faq-answer-text">' + escapeHtml(faq.answer) + '</div>' +
      '<div class="faq-actions">' +
      '<button onclick="event.stopPropagation(); FAQList.editFaq(' + faq.id + ')">Edit</button>' +
      '<button onclick="event.stopPropagation(); FAQList.deleteFaq(' + faq.id + ')" class="btn-delete">Delete</button>' +
      '</div></div></div>';
  }
  
  function renderFaqList() {
    return '<div class="faq-section"><div class="section-header">' +
      '<h3>FAQs (' + faqs.length + ')</h3>' +
      '<button onclick="FAQList.showCreateForm()">Add FAQ</button></div>' +
      (editingFaqId !== null ? renderFaqForm() : '') +
      '<div class="faq-list">' +
      (faqs.length === 0 ? '<p class="empty-state">No FAQs yet. Create your first one!</p>' :
        faqs.map(faq => renderFaq(faq)).join('')) +
      '</div></div>';
  }
  
  function renderFaqForm() {
    const isEditing = editingFaqId > 0;
    const faq = isEditing ? faqs.find(f => f.id === editingFaqId) : { question: '', answer: '' };
    return '<div class="faq-form"><h4>' + (isEditing ? 'Edit' : 'Create') + ' FAQ</h4>' +
      '<form onsubmit="FAQList.handleSubmit(event); return false;">' +
      '<div class="form-group"><label for="faq-question">Question:</label>' +
      '<textarea id="faq-question" name="question" required rows="2" placeholder="Enter the question...">' +
      (isEditing ? escapeHtml(faq.question) : '') + '</textarea></div>' +
      '<div class="form-group"><label for="faq-answer">Answer:</label>' +
      '<textarea id="faq-answer" name="answer" required rows="4" placeholder="Enter the answer...">' +
      (isEditing ? escapeHtml(faq.answer) : '') + '</textarea></div>' +
      '<div class="form-actions"><button type="submit" class="btn-primary">' + (isEditing ? 'Update' : 'Create') + '</button>' +
      '<button type="button" onclick="FAQList.cancelForm()">Cancel</button></div></form></div>';
  }
  
  async function loadFaqs(moduleId) {
    try {
      const response = await fetch(API_BASE + '/modules/' + moduleId + '/faqs');
      if (!response.ok) throw new Error('Failed to load FAQs');
      faqs = await response.json();
      currentModuleId = moduleId;
      render();
    } catch (error) {
      showError(error.message);
    }
  }
  
  function toggleFaq(id) {
    const faq = faqs.find(f => f.id === id);
    if (faq) {
      faq._expanded = !faq._expanded;
      render();
    }
  }
  
  function showCreateForm() { editingFaqId = 0; render(); }
  function editFaq(id) { editingFaqId = id; render(); }
  function cancelForm() { editingFaqId = null; render(); }
  
  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = { question: formData.get('question').trim(), answer: formData.get('answer').trim() };
    if (!data.question || !data.answer) { showError('Both question and answer are required'); return; }
    try {
      const isEditing = editingFaqId > 0;
      const url = isEditing ? API_BASE + '/faqs/' + editingFaqId :
        API_BASE + '/modules/' + currentModuleId + '/faqs';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(isEditing ? 'Failed to update FAQ' : 'Failed to create FAQ');
      editingFaqId = null;
      await loadFaqs(currentModuleId);
    } catch (error) {
      showError(error.message);
    }
  }
  
  async function deleteFaq(id) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const response = await fetch(API_BASE + '/faqs/' + id, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete FAQ');
      await loadFaqs(currentModuleId);
    } catch (error) {
      showError(error.message);
    }
  }
  
  function render(containerId) {
    const container = document.getElementById(containerId || 'faq-container');
    if (container) container.innerHTML = renderFaqList();
  }
  
  window.FAQList = {
    load: loadFaqs, render, toggleFaq, showCreateForm,
    editFaq, deleteFaq, cancelForm, handleSubmit, renderHtml: renderFaqList
  };
})();
