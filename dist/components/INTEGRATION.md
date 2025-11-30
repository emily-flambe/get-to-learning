# Content Components Integration Guide

## For PROJECT-UI Agent

These components are ready to integrate into your main app.js router.

## Quick Start

### 1. Add to index.html
```html
<!-- In <head> -->
<link rel="stylesheet" href="components/content-components.css">

<!-- Before closing </body> -->
<script src="components/FlashcardList.js"></script>
<script src="components/FAQList.js"></script>
<script src="components/ReviewMode.js"></script>
```

### 2. Add containers to module view
```html
<!-- Module view template -->
<div class="module-view">
  <div class="breadcrumb">...</div>
  <h1>Module Name</h1>
  
  <!-- Flashcard section -->
  <div id="flashcard-container"></div>
  
  <!-- FAQ section -->
  <div id="faq-container"></div>
</div>
```

### 3. Router integration
```javascript
// In your router
if (path.match(/^\/modules\/(\d+)$/)) {
  const moduleId = parseInt(path.match(/^\/modules\/(\d+)$/)[1]);
  
  // Render module header/breadcrumb
  // ...
  
  // Load flashcards and FAQs
  FlashcardList.load(moduleId);
  FAQList.load(moduleId);
}

// Review mode route
if (path.match(/^\/modules\/(\d+)\/review$/)) {
  const moduleId = parseInt(path.match(/^\/modules\/(\d+)\/review$/)[1]);
  
  // Fetch flashcards from API
  fetch(`/api/modules/${moduleId}/flashcards`)
    .then(res => res.json())
    .then(flashcards => {
      ReviewMode.start(moduleId, flashcards);
    });
}
```

## Component APIs

### FlashcardList
```javascript
FlashcardList.load(moduleId)           // Load and render
FlashcardList.render(containerId)      // Re-render
FlashcardList.toggleFlashcard(id)      // Flip card
FlashcardList.showCreateForm()         // Show create form
FlashcardList.editFlashcard(id)        // Edit mode
FlashcardList.deleteFlashcard(id)      // Delete with confirm
FlashcardList.startReview()            // Launch review mode
```

### FAQList
```javascript
FAQList.load(moduleId)                 // Load and render
FAQList.render(containerId)            // Re-render
FAQList.toggleFaq(id)                  // Expand/collapse
FAQList.showCreateForm()               // Show create form
FAQList.editFaq(id)                    // Edit mode
FAQList.deleteFaq(id)                  // Delete with confirm
```

### ReviewMode
```javascript
ReviewMode.start(moduleId, flashcards, containerId)  // Start review
ReviewMode.showAnswer()                // Reveal answer
ReviewMode.nextCard()                  // Next card
ReviewMode.previousCard()              // Previous card
ReviewMode.skipCard()                  // Skip to next
ReviewMode.exit()                      // Exit to module
```

## CSS Classes Reference

All styles are in `content-components.css`. Key classes:

- `.flashcard-section` - Flashcard container
- `.faq-section` - FAQ container
- `.review-mode` - Full-screen review overlay
- `.error-message` - Error notifications
- `.btn-primary`, `.btn-delete`, `.btn-exit` - Button variants

## Notes for Integration

1. Components use global `window` namespace (FlashcardList, FAQList, ReviewMode)
2. All API calls use `/api` base path
3. Error messages auto-dismiss after 5 seconds
4. Review mode uses fixed positioning (z-index: 1000)
5. All user input is XSS-protected via escapeHtml()
6. Delete operations require user confirmation
7. Forms use inline validation

## Testing

Test locally with `demo.html` or integrate into your routing system.
