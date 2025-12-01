/**
 * QuestionList Component - Questions with Tags Support
 */
(function() {
  'use strict';
  const API_BASE = '/api';

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function renderMarkdown(text) {
    if (!text) return '';
    return escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')  // **bold**
      .replace(/\n/g, '<br>');  // newlines
  }

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  let currentModuleId = null, questions = [], editingQuestionId = null, selectedTag = null;

  function getAllTags() {
    const tagSet = new Set();
    questions.forEach(q => {
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  function getFilteredQuestions() {
    if (!selectedTag) return questions;
    return questions.filter(q => q.tags && q.tags.includes(selectedTag));
  }

  function renderTagFilter() {
    const allTags = getAllTags();
    if (allTags.length === 0) return '';
    return '<div class="tag-filter">' +
      '<span class="tag-filter-label">Filter by tag:</span>' +
      '<div class="tag-chips">' +
      '<span class="tag-chip tag-clear ' + (selectedTag === null ? 'selected' : '') + '" ' +
      'onclick="FAQList.filterByTag(null)">All</span>' +
      allTags.map(tag =>
        '<span class="tag-chip ' + (selectedTag === tag ? 'selected' : '') + '" ' +
        'onclick="FAQList.filterByTag(\'' + escapeHtml(tag) + '\')">' + escapeHtml(tag) + '</span>'
      ).join('') +
      '</div></div>';
  }

  function renderQuestionTags(tags) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) return '';
    return '<div class="question-tags">' +
      tags.map(tag => '<span class="question-tag">' + escapeHtml(tag) + '</span>').join('') +
      '</div>';
  }

  function renderQuestion(q) {
    const isExpanded = q._expanded || false;
    return '<div class="faq-item ' + (isExpanded ? 'expanded' : '') + '" data-id="' + q.id + '">' +
      '<div class="faq-question" onclick="FAQList.toggleQuestion(' + q.id + ')">' +
      '<span class="faq-icon">' + (isExpanded ? '&#9660;' : '&#9654;') + '</span>' +
      '<span class="faq-question-text">' + escapeHtml(q.question) + '</span></div>' +
      '<div class="faq-answer ' + (isExpanded ? '' : 'hidden') + '">' +
      '<div class="faq-answer-text">' + renderMarkdown(q.answer) + '</div>' +
      renderQuestionTags(q.tags) +
      '<div class="faq-actions">' +
      '<button onclick="event.stopPropagation(); FAQList.editQuestion(' + q.id + ')">Edit</button>' +
      '<button onclick="event.stopPropagation(); FAQList.deleteQuestion(' + q.id + ')" class="btn-delete">Delete</button>' +
      '</div></div></div>';
  }

  function renderQuestionList() {
    const filteredQuestions = getFilteredQuestions();
    return '<div class="faq-section"><div class="section-header">' +
      '<h3>Questions (' + filteredQuestions.length + (selectedTag ? ' of ' + questions.length : '') + ')</h3>' +
      '<div class="section-actions">' +
      '<button onclick="FAQList.showCreateForm()">Add Question</button></div></div>' +
      (editingQuestionId !== null ? renderQuestionForm() : '') +
      renderTagFilter() +
      '<div class="faq-list">' +
      (filteredQuestions.length === 0 ?
        '<p class="empty-state">' + (selectedTag ? 'No questions with tag "' + escapeHtml(selectedTag) + '"' : 'No questions yet. Create your first one!') + '</p>' :
        filteredQuestions.map(q => renderQuestion(q)).join('')) +
      '</div></div>';
  }

  function renderQuestionForm() {
    const isEditing = editingQuestionId > 0;
    const question = isEditing ? questions.find(q => q.id === editingQuestionId) : { question: '', answer: '', tags: [] };
    const tagsStr = question.tags ? question.tags.join(', ') : '';
    return '<div class="faq-form"><h4>' + (isEditing ? 'Edit' : 'Create') + ' Question</h4>' +
      '<form onsubmit="FAQList.handleSubmit(event); return false;">' +
      '<div class="form-group"><label for="question-text">Question:</label>' +
      '<textarea id="question-text" name="question" required rows="2" placeholder="Enter the question...">' +
      (isEditing ? escapeHtml(question.question) : '') + '</textarea></div>' +
      '<div class="form-group"><label for="answer-text">Answer:</label>' +
      '<textarea id="answer-text" name="answer" required rows="3" placeholder="Enter the answer...">' +
      (isEditing ? escapeHtml(question.answer) : '') + '</textarea></div>' +
      '<div class="form-group"><label for="tags-text">Tags (comma-separated):</label>' +
      '<input type="text" id="tags-text" name="tags" placeholder="e.g., Chapter 4, B-Tree, Index" value="' + escapeHtml(tagsStr) + '"></div>' +
      '<div class="form-actions"><button type="submit" class="btn-primary">' + (isEditing ? 'Update' : 'Create') + '</button>' +
      '<button type="button" onclick="FAQList.cancelForm()">Cancel</button></div></form></div>';
  }

  async function loadQuestions(moduleId) {
    try {
      const response = await fetch(API_BASE + '/modules/' + moduleId + '/faqs');
      if (!response.ok) throw new Error('Failed to load questions');
      questions = await response.json();
      currentModuleId = moduleId;
      selectedTag = null;
      render();
    } catch (error) {
      showError(error.message);
    }
  }

  function toggleQuestion(id) {
    const question = questions.find(q => q.id === id);
    if (question) {
      question._expanded = !question._expanded;
      render();
    }
  }

  function filterByTag(tag) {
    selectedTag = tag;
    render();
  }

  function showCreateForm() { editingQuestionId = 0; render(); }
  function editQuestion(id) { editingQuestionId = id; render(); }
  function cancelForm() { editingQuestionId = null; render(); }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const tagsStr = formData.get('tags') || '';
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const data = {
      question: formData.get('question').trim(),
      answer: formData.get('answer').trim(),
      tags: tags
    };
    if (!data.question || !data.answer) { showError('Both question and answer are required'); return; }
    try {
      const isEditing = editingQuestionId > 0;
      const url = isEditing ? API_BASE + '/faqs/' + editingQuestionId :
        API_BASE + '/modules/' + currentModuleId + '/faqs';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(isEditing ? 'Failed to update question' : 'Failed to create question');
      editingQuestionId = null;
      await loadQuestions(currentModuleId);
    } catch (error) {
      showError(error.message);
    }
  }

  async function deleteQuestion(id) {
    const password = prompt('Enter password to delete this question:');
    if (!password) return;
    try {
      const response = await fetch(API_BASE + '/faqs/' + id, {
        method: 'DELETE',
        headers: { 'X-Delete-Password': password }
      });
      if (!response.ok) throw new Error('Failed to delete question');
      await loadQuestions(currentModuleId);
    } catch (error) {
      showError(error.message);
    }
  }

  function render(containerId) {
    const container = document.getElementById(containerId || 'faq-container');
    if (container) container.innerHTML = renderQuestionList();
  }

  window.FAQList = {
    load: loadQuestions, render, toggleQuestion, filterByTag, showCreateForm,
    editQuestion, deleteQuestion, cancelForm, handleSubmit,
    renderHtml: renderQuestionList
  };
})();
