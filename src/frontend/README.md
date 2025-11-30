# GTL Frontend

Simple, clean frontend for the Get To Learning platform.

## Structure

```
src/frontend/
├── index.html        # Main HTML template
├── styles.css        # Global styles
├── app.js           # Main application logic
└── README.md        # This file
```

## Features

### Project Management
- List all projects in a card grid layout
- Create new projects with name and optional description
- Edit existing projects
- Delete projects with confirmation
- Click project card to view modules

### Module Management
- List modules for a specific project
- Create new modules with name and optional description
- Edit existing modules
- Delete modules with confirmation
- Breadcrumb navigation showing current location
- Back button to return to project list

### UI Design
- Clean, minimal design with system fonts
- Mobile-first responsive layout
- Modal dialogs for forms
- Confirmation dialogs for destructive actions
- Error handling and display
- Loading states

## Navigation

The app uses hash-based routing:

- `#/` or `#/projects` - Project list view
- `#/projects/:id` - Module list for a specific project
- `#/modules/:id` - Module content view (placeholder)

## API Integration

All CRUD operations use the REST API:

```javascript
GET    /api/projects           // List all projects
POST   /api/projects           // Create project
PUT    /api/projects/:id       // Update project
DELETE /api/projects/:id       // Delete project

GET    /api/projects/:id       // Get project with modules
POST   /api/projects/:id/modules // Create module
PUT    /api/modules/:id        // Update module
DELETE /api/modules/:id        // Delete module
```

## Development

Build the frontend:
```bash
npm run build:frontend
```

Run the dev server (builds frontend first):
```bash
npm run dev
```

Deploy (builds frontend first):
```bash
npm run deploy
```

## Technical Details

- **Build Tool**: Vite
- **JavaScript**: Vanilla JS (no framework)
- **Styling**: Pure CSS with system fonts
- **Routing**: Hash-based SPA routing
- **State**: Simple in-memory state object

## Boundaries

This agent handles ONLY:
- Project list and CRUD operations
- Module list and CRUD operations
- Navigation between views

This agent does NOT handle:
- Flashcard views/management
- FAQ views/management
- Module content display

Those features will be implemented by another agent.
