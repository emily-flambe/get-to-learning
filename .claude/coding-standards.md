# Coding Standards

## TypeScript (Backend)

### File Organization

```typescript
// 1. Imports
import { Hono } from 'hono';
import type { Env, SomeType } from '../types';
import * as db from '../db/queries';

// 2. App initialization
const app = new Hono<{ Bindings: Env }>();

// 3. Route handlers (ordered by HTTP method: GET, POST, PUT, DELETE)

// 4. Export
export default app;
```

### Type Definitions

All types go in `src/types.ts`:

```typescript
// Data models (match database schema)
export interface Flashcard {
  id: number;
  module_id: number;
  front: string;
  back: string;
  created_at: number;
  updated_at: number;
}

// Request types (for API input validation)
export interface CreateFlashcardRequest {
  front: string;
  back: string;
}

// Environment bindings
export interface Env {
  DB: D1Database;
}
```

### Error Handling

```typescript
app.get('/path', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid ID' }, 400);
    }

    const result = await db.getById(c.env.DB, id);
    if (!result) {
      return c.json({ error: 'Not found' }, 404);
    }

    return c.json(result);
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
```

### Input Validation

```typescript
// Validate required fields
if (!body.front || typeof body.front !== 'string' || body.front.trim().length === 0) {
  return c.json({ error: 'Front is required' }, 400);
}

// Trim before storing
const data = {
  front: body.front.trim(),
  back: body.back.trim()
};
```

## JavaScript (Frontend)

### Component Structure

```javascript
(function() {
  'use strict';

  // Constants at top
  const API_BASE = '/api';

  // Utility functions
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // State variables
  let items = [];
  let selectedId = null;

  // Render functions (pure, return HTML strings)
  function renderItem(item) {
    return '<div class="item">' + escapeHtml(item.name) + '</div>';
  }

  // Action functions (modify state, call render)
  function selectItem(id) {
    selectedId = id;
    render();
  }

  // API functions (async)
  async function loadItems(parentId) {
    const response = await fetch(API_BASE + '/items/' + parentId);
    items = await response.json();
    render();
  }

  // Main render function
  function render(containerId) {
    const container = document.getElementById(containerId || 'container');
    if (container) container.innerHTML = renderList();
  }

  // Export public API
  window.ComponentName = {
    load: loadItems,
    render: render,
    select: selectItem
  };
})();
```

### HTML Generation

Use string concatenation (not template literals for consistency with existing code):

```javascript
// Good
return '<div class="item ' + (isActive ? 'active' : '') + '">' +
  '<span>' + escapeHtml(text) + '</span>' +
  '</div>';

// Always escape user content
escapeHtml(item.front)
escapeHtml(item.question)
```

### Event Handlers

Use inline handlers with global function calls:

```javascript
// In HTML
'<button onclick="ComponentName.doAction(' + id + ')">Action</button>'

// For preventing propagation
'<button onclick="event.stopPropagation(); ComponentName.delete(' + id + ')">Delete</button>'
```

## CSS

### Naming Convention

```css
/* Component prefix */
.fc-*       /* Flashcard components */
.faq-*      /* FAQ components */
.review-*   /* Review mode components */

/* State modifiers */
.selected   /* Selected state */
.expanded   /* Expanded accordion */
.hidden     /* Hidden element */
```

### Structure

```css
/* Section Layout */
.component-section { }
.section-header { }
.section-actions { }

/* List/Container */
.component-list { }
.component-item { }

/* States */
.component-item.selected { }
.component-item:hover { }
```

### Responsive Design

Mobile breakpoint at 768px:

```css
@media (max-width: 768px) {
  .section-header { flex-direction: column; }
  .section-actions { width: 100%; }
}
```

## Git Conventions

### Commit Messages

```
feat: add bulk flashcard import
fix: correct module deletion cascade
chore: update dependencies
docs: add API documentation
refactor: simplify flashcard rendering
style: improve chip spacing
```

### Branch Naming

```
feature/bulk-import
fix/cascade-delete
chore/update-deps
```
