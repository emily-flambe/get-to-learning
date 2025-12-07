# API Reference

Base URL: `/api`

## Health Check

```
GET /api/health
Response: { status: "ok", timestamp: string, message: string }
```

## Projects

```
GET    /api/projects                           # List all projects
GET    /api/projects/:id                       # Get project by ID
POST   /api/projects                           # Create project
PUT    /api/projects/:id                       # Update project
DELETE /api/projects/:id                       # Delete project (cascades to modules)
GET    /api/projects/:projectId/flashcards     # Get flashcards from project modules
GET    /api/projects/:projectId/faqs           # Get FAQs from project modules
```

**Create/Update Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Multi-Module Content Endpoints:**

```
GET /api/projects/:projectId/flashcards?modules=1,2,3
```
- Returns flashcards from specified modules within the project
- Query param `modules` is optional - omit to get content from all modules in project
- Returns flashcards sorted alphabetically by front text (case-insensitive)
- Validates that project exists and all specified modules belong to the project

```
GET /api/projects/:projectId/faqs?modules=1,2,3
```
- Returns FAQs from specified modules within the project
- Query param `modules` is optional - omit to get content from all modules in project
- Returns FAQs sorted alphabetically by question text (case-insensitive)
- Validates that project exists and all specified modules belong to the project

## Modules

```
GET    /api/projects/:projectId/modules  # List modules in project
GET    /api/modules/:id                  # Get module by ID
POST   /api/projects/:projectId/modules  # Create module
PUT    /api/modules/:id                  # Update module
DELETE /api/modules/:id                  # Delete module (cascades)
```

**Create/Update Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "sort_order": "number (optional, default 0)"
}
```

## Flashcards

```
GET    /api/modules/:moduleId/flashcards       # List flashcards in module
POST   /api/modules/:moduleId/flashcards       # Create single flashcard
POST   /api/modules/:moduleId/flashcards/bulk  # Bulk create flashcards
PUT    /api/flashcards/:id                     # Update flashcard
DELETE /api/flashcards/:id                     # Delete flashcard
```

**Single Create/Update Body:**
```json
{
  "front": "string (required)",
  "back": "string (required)"
}
```

**Bulk Create Body:**
```json
{
  "flashcards": [
    { "front": "string", "back": "string" },
    { "front": "string", "back": "string" }
  ]
}
```

## FAQs

```
GET    /api/modules/:moduleId/faqs       # List FAQs in module
POST   /api/modules/:moduleId/faqs       # Create single FAQ
POST   /api/modules/:moduleId/faqs/bulk  # Bulk create FAQs
PUT    /api/faqs/:id                     # Update FAQ
DELETE /api/faqs/:id                     # Delete FAQ
```

**Single Create/Update Body:**
```json
{
  "question": "string (required)",
  "answer": "string (required)"
}
```

**Bulk Create Body:**
```json
{
  "faqs": [
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" }
  ]
}
```

## Database Schema

```sql
-- Projects table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Modules table
CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Flashcards table
CREATE TABLE flashcards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- FAQs table
CREATE TABLE faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_modules_project ON modules(project_id);
CREATE INDEX idx_flashcards_module ON flashcards(module_id);
CREATE INDEX idx_faqs_module ON faqs(module_id);
```

## Error Responses

All errors return JSON with `error` field:

```json
{ "error": "Error message" }
```

Status codes:
- `400` - Bad request (validation error)
- `404` - Not found
- `500` - Internal server error
