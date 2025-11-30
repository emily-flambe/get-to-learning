/**
 * ReviewMode Component - Simple flashcard review interface
 */
(function() {
  'use strict';
  
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  
  let flashcards = [], currentIndex = 0, showingAnswer = false, moduleId = null, containerId = 'app';
  
  function renderReview() {
    if (flashcards.length === 0) {
      return '<div class="review-mode"><div class="review-empty">' +
        '<h2>No Flashcards Available</h2>' +
        '<p>Add some flashcards to the module before starting review.</p>' +
        '<button onclick="ReviewMode.exit()" class="btn-primary">Back to Module</button>' +
        '</div></div>';
    }
    const currentCard = flashcards[currentIndex];
    const progress = (currentIndex + 1) + ' of ' + flashcards.length;
    return '<div class="review-mode"><div class="review-header">' +
      '<div class="review-progress">' + progress + '</div>' +
      '<button onclick="ReviewMode.exit()" class="btn-exit">Exit Review</button></div>' +
      '<div class="review-card"><div class="review-card-front">' +
      '<div class="review-label">Question:</div>' +
      '<div class="review-text">' + escapeHtml(currentCard.front) + '</div></div>' +
      (showingAnswer ? '<div class="review-card-back"><div class="review-label">Answer:</div>' +
        '<div class="review-text">' + escapeHtml(currentCard.back) + '</div></div>' : '') +
      '</div><div class="review-controls">' +
      (!showingAnswer ? '<button onclick="ReviewMode.showAnswer()" class="btn-primary btn-large">Show Answer</button>' :
        '<button onclick="ReviewMode.nextCard()" class="btn-primary btn-large">' +
        (currentIndex < flashcards.length - 1 ? 'Next Card' : 'Finish Review') + '</button>') +
      '</div><div class="review-navigation">' +
      (currentIndex > 0 ? '<button onclick="ReviewMode.previousCard()">Previous</button>' : '<span></span>') +
      (currentIndex < flashcards.length - 1 ? '<button onclick="ReviewMode.skipCard()">Skip</button>' : '') +
      '</div></div>';
  }
  
  function start(modId, cards, container) {
    moduleId = modId;
    flashcards = cards || [];
    currentIndex = 0;
    showingAnswer = false;
    containerId = container || 'app';
    render();
  }
  
  function showAnswer() { showingAnswer = true; render(); }
  
  function nextCard() {
    if (currentIndex < flashcards.length - 1) {
      currentIndex++;
      showingAnswer = false;
      render();
    } else {
      if (confirm('Review complete! Would you like to start over?')) {
        currentIndex = 0;
        showingAnswer = false;
        render();
      } else {
        exit();
      }
    }
  }
  
  function previousCard() {
    if (currentIndex > 0) {
      currentIndex--;
      showingAnswer = false;
      render();
    }
  }
  
  function skipCard() {
    if (currentIndex < flashcards.length - 1) {
      currentIndex++;
      showingAnswer = false;
      render();
    }
  }
  
  function exit() {
    window.location.href = '/#/modules/' + moduleId;
  }
  
  function reset() {
    flashcards = [];
    currentIndex = 0;
    showingAnswer = false;
    moduleId = null;
  }
  
  function render() {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = renderReview();
  }
  
  window.ReviewMode = {
    start, showAnswer, nextCard, previousCard, skipCard,
    exit, reset, render, renderHtml: renderReview
  };
})();
