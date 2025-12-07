# Frontend Components

## Overview

The frontend uses vanilla JavaScript with hash-based routing. Components are self-contained IIFEs that expose methods on `window`.

## File Locations

**Source files (edit these):**
- `src/frontend/components/FlashcardList.js`
- `src/frontend/components/FAQList.js`
- `src/frontend/components/ReviewMode.js`
- `src/frontend/components/content-components.css`

**Build output (never edit directly):**
- `dist/components/*` - copied from src during build, wiped on each build

The vite build process copies `src/frontend/components/` to `dist/components/` via a custom plugin in `vite.config.js`.

## Component Pattern

```javascript
(function() {
  'use strict';
  const API_BASE = '/api';

  // Private state
  let items = [];

  // Private functions
  function render() { /* ... */ }

  // Expose public API
  window.ComponentName = {
    load: loadItems,
    render: render,
    // ... other methods
  };
})();
```

## FlashcardList.js

Displays flashcards as compact chips with a detail panel below. Supports both single-module and multi-module loading.

**State:**
- `flashcards` - Array of flashcard objects
- `currentModuleId` - Active module ID (for single-module mode)
- `currentProjectId` - Active project ID (for multi-module mode)
- `currentModuleIds` - Array of module IDs (for multi-module mode)
- `selectedFlashcardId` - Currently selected chip (shows detail panel)
- `editingFlashcardId` - ID of flashcard being edited (0 for new)

**Public Methods:**
- `FlashcardList.load(moduleId)` - Load flashcards for single module
- `FlashcardList.loadMultiple(projectId, moduleIds)` - Load flashcards from multiple modules
- `FlashcardList.render(containerId)` - Render to container
- `FlashcardList.selectFlashcard(id)` - Select/deselect a chip
- `FlashcardList.closeDetail()` - Close detail panel
- `FlashcardList.showCreateForm()` - Show create form (with module selector in multi-module mode)
- `FlashcardList.editFlashcard(id)` - Show edit form
- `FlashcardList.deleteFlashcard(id)` - Delete with confirmation
- `FlashcardList.startReview()` - Navigate to review mode (project-based if in multi-module mode)

**Multi-Module Features:**
- When `loadMultiple()` is used, create form displays a module selector dropdown
- Module selector populated from `window.state.modules`
- Start Review navigates to `#/projects/{id}/review` instead of module-based review

**UI Elements:**
- `.fc-chips` - Container for all chip elements
- `.fc-chip` - Individual clickable chip
- `.fc-chip.selected` - Highlighted selected chip
- `.fc-detail-panel` - Detail display below chips

## FAQList.js (Questions with Tags)

Displays Questions in an accordion format with tag filtering. Supports both single-module and multi-module loading.

**State:**
- `questions` - Array of question objects
- `currentModuleId` - Active module ID (for single-module mode)
- `currentProjectId` - Active project ID (for multi-module mode)
- `currentModuleIds` - Array of module IDs (for multi-module mode)
- `editingQuestionId` - ID of question being edited
- `selectedTag` - Currently selected tag filter (null = show all)

**Public Methods:**
- `FAQList.load(moduleId)` - Load questions for single module
- `FAQList.loadMultiple(projectId, moduleIds)` - Load questions from multiple modules
- `FAQList.render(containerId)` - Render to container
- `FAQList.toggleQuestion(id)` - Expand/collapse question
- `FAQList.filterByTag(tag)` - Filter by tag (null to clear)
- `FAQList.showCreateForm()` - Show create form (with module selector in multi-module mode)
- `FAQList.editQuestion(id)` - Show edit form
- `FAQList.deleteQuestion(id)` - Delete with confirmation

**Multi-Module Features:**
- When `loadMultiple()` is used, create form displays a module selector dropdown
- Module selector populated from `window.state.modules`

**UI Elements:**
- `.faq-list` - Container for question items
- `.faq-item` - Individual question
- `.faq-item.expanded` - Expanded question showing answer
- `.faq-question` - Clickable question header
- `.faq-answer` - Collapsible answer content
- `.tag-filter` - Tag filter bar
- `.tag-chip` - Individual tag filter button
- `.question-tags` - Tags displayed on each question

## ReviewMode.js

Full-screen flashcard study mode. Supports both single-module and multi-module review sessions.

**State:**
- `flashcards` - Shuffled array for review
- `currentIndex` - Current card position
- `isFlipped` - Whether answer is shown
- `moduleId` - Source module ID (for single-module mode)
- `projectId` - Source project ID (for multi-module mode)

**Public Methods:**
- `ReviewMode.start(moduleId)` - Begin single-module review session
- `ReviewMode.startWithProject(projectId, cards, container)` - Begin multi-module review session
- `ReviewMode.flip()` - Show answer
- `ReviewMode.next()` - Go to next card
- `ReviewMode.prev()` - Go to previous card
- `ReviewMode.exit()` - Return to source page (project or module based on context)

**Multi-Module Features:**
- `startWithProject()` sets `projectId` instead of `moduleId`
- Exit returns to `#/projects/{projectId}` when in project-based review mode
- Exit returns to `#/modules/{moduleId}` when in module-based review mode

## CSS Classes

### Layout
- `.flashcard-section`, `.faq-section` - Section containers
- `.section-header` - Header with title and actions
- `.section-actions` - Button group

### Module Selector
- `.module-selector` - Container for module selection UI
- `.module-selector-header` - Header row with title and "Select All" button
- `.module-checkboxes` - Flex container for checkbox items
- `.module-checkbox` - Individual checkbox wrapper with label
- `.module-checkbox.selected` - Selected state styling
- Responsive: Wraps on mobile, inline on larger screens

### Buttons
- `button` - Base button style
- `.btn-primary` - Blue primary action
- `.btn-delete` - Red delete action
- `.btn-exit` - Gray exit action
- `.btn-large` - Larger button for review mode

### Flashcard Chips
- `.fc-chips` - Flex container for chips
- `.fc-chip` - Individual chip
- `.fc-chip.selected` - Selected state
- `.fc-chip-icon` - Arrow indicator
- `.fc-chip-text` - Term text

### Detail Panel
- `.fc-detail-panel` - Container below chips
- `.fc-detail-header` - Term + close button
- `.fc-detail-front` - Term display
- `.fc-detail-close` - X button
- `.fc-detail-back` - Definition text
- `.fc-detail-actions` - Edit/Delete buttons

### FAQ Accordion
- `.faq-list` - FAQ container
- `.faq-item` - Individual FAQ
- `.faq-item.expanded` - Expanded state
- `.faq-question` - Clickable header
- `.faq-icon` - Arrow indicator
- `.faq-answer` - Collapsible content

### Review Mode
- `.review-mode` - Full-screen overlay
- `.review-header` - Progress display
- `.review-card` - Card container
- `.review-card-front`, `.review-card-back` - Card faces
- `.review-controls` - Flip button
- `.review-navigation` - Prev/Next buttons
