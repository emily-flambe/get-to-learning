# GTL Content Components

Flashcard and FAQ components for Get To Learning frontend.

## Files

- `FlashcardList.js` - Flashcard CRUD component
- `FAQList.js` - FAQ CRUD component
- `ReviewMode.js` - Flashcard review interface
- `content-components.css` - All component styles
- `demo.html` - Demo page

## Integration

```html
<link rel="stylesheet" href="components/content-components.css">
<script src="components/FlashcardList.js"></script>
<script src="components/FAQList.js"></script>
<script src="components/ReviewMode.js"></script>

<div id="flashcard-container"></div>
<div id="faq-container"></div>

<script>
  FlashcardList.load(moduleId);
  FAQList.load(moduleId);
</script>
```

## API

### FlashcardList
- `load(moduleId)` - Load flashcards
- `toggleFlashcard(id)` - Flip card
- `showCreateForm()` - Show create form
- `editFlashcard(id)` - Edit card
- `deleteFlashcard(id)` - Delete card
- `startReview()` - Start review mode

### FAQList
- `load(moduleId)` - Load FAQs
- `toggleFaq(id)` - Expand/collapse
- `showCreateForm()` - Show create form
- `editFaq(id)` - Edit FAQ
- `deleteFaq(id)` - Delete FAQ

### ReviewMode
- `start(moduleId, flashcards, containerId)` - Start review
- `showAnswer()` - Reveal answer
- `nextCard()` - Next card
- `previousCard()` - Previous card
- `skipCard()` - Skip card
- `exit()` - Exit review

## API Endpoints

### Flashcards
- GET `/api/modules/:id/flashcards` - List
- POST `/api/modules/:id/flashcards` - Create
- PUT `/api/flashcards/:id` - Update
- DELETE `/api/flashcards/:id` - Delete

### FAQs
- GET `/api/modules/:id/faqs` - List
- POST `/api/modules/:id/faqs` - Create
- PUT `/api/faqs/:id` - Update
- DELETE `/api/faqs/:id` - Delete

## Security

All user input is escaped using `escapeHtml()` to prevent XSS attacks.
