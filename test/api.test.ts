import { describe, it, expect, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';

// Clean up and initialize tables before each test
beforeEach(async () => {
  // Drop tables in correct order (foreign key dependencies)
  await env.DB.prepare('DROP TABLE IF EXISTS faqs').run();
  await env.DB.prepare('DROP TABLE IF EXISTS flashcards').run();
  await env.DB.prepare('DROP TABLE IF EXISTS modules').run();
  await env.DB.prepare('DROP TABLE IF EXISTS projects').run();

  // Create tables
  await env.DB.prepare(`
    CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )
  `).run();
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await SELF.fetch('http://localhost/api/health');
    expect(response.status).toBe(200);
    const data = await response.json() as { status: string };
    expect(data.status).toBe('ok');
  });
});

describe('Projects API', () => {
  it('GET /api/projects - should return empty list initially', async () => {
    const response = await SELF.fetch('http://localhost/api/projects');
    expect(response.status).toBe(200);
    const data = await response.json() as unknown[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it('POST /api/projects - should create a project', async () => {
    const response = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Project', description: 'A test project' }),
    });
    expect(response.status).toBe(201);
    const data = await response.json() as { id: number; name: string; description: string };
    expect(data.name).toBe('Test Project');
    expect(data.description).toBe('A test project');
    expect(data.id).toBeDefined();
  });

  it('POST /api/projects - should reject empty name', async () => {
    const response = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', description: 'No name' }),
    });
    expect(response.status).toBe(400);
  });

  it('GET /api/projects/:id - should return a project', async () => {
    const createRes = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Get Test' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/projects/${created.id}`);
    expect(response.status).toBe(200);
    const data = await response.json() as { name: string };
    expect(data.name).toBe('Get Test');
  });

  it('PUT /api/projects/:id - should update a project', async () => {
    const createRes = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Original' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/projects/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(response.status).toBe(200);
    const data = await response.json() as { name: string };
    expect(data.name).toBe('Updated');
  });

  it('DELETE /api/projects/:id - should delete a project', async () => {
    const createRes = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'To Delete' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/projects/${created.id}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(200);

    const getRes = await SELF.fetch(`http://localhost/api/projects/${created.id}`);
    expect(getRes.status).toBe(404);
  });
});

describe('Modules API', () => {
  let projectId: number;

  beforeEach(async () => {
    const res = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Module Test Project' }),
    });
    const data = await res.json() as { id: number };
    projectId = data.id;
  });

  it('POST /api/projects/:id/modules - should create a module', async () => {
    const response = await SELF.fetch(`http://localhost/api/projects/${projectId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Module', description: 'A test module' }),
    });
    expect(response.status).toBe(201);
    const data = await response.json() as { name: string; project_id: number };
    expect(data.name).toBe('Test Module');
    expect(data.project_id).toBe(projectId);
  });

  it('GET /api/modules/:id - should return a module', async () => {
    const createRes = await SELF.fetch(`http://localhost/api/projects/${projectId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Get Module Test' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/modules/${created.id}`);
    expect(response.status).toBe(200);
    const data = await response.json() as { name: string };
    expect(data.name).toBe('Get Module Test');
  });

  it('PUT /api/modules/:id - should update a module', async () => {
    const createRes = await SELF.fetch(`http://localhost/api/projects/${projectId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Original Module' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/modules/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Module' }),
    });
    expect(response.status).toBe(200);
    const data = await response.json() as { name: string };
    expect(data.name).toBe('Updated Module');
  });

  it('DELETE /api/modules/:id - should delete a module', async () => {
    const createRes = await SELF.fetch(`http://localhost/api/projects/${projectId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'To Delete Module' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/modules/${created.id}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(200);
  });
});

describe('Flashcards API', () => {
  let moduleId: number;

  beforeEach(async () => {
    const projectRes = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Flashcard Test Project' }),
    });
    const project = await projectRes.json() as { id: number };

    const moduleRes = await SELF.fetch(`http://localhost/api/projects/${project.id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Flashcard Test Module' }),
    });
    const module = await moduleRes.json() as { id: number };
    moduleId = module.id;
  });

  it('GET /api/modules/:id/flashcards - should return empty list initially', async () => {
    const response = await SELF.fetch(`http://localhost/api/modules/${moduleId}/flashcards`);
    expect(response.status).toBe(200);
    const data = await response.json() as unknown[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it('POST /api/modules/:id/flashcards - should create a flashcard', async () => {
    const response = await SELF.fetch(`http://localhost/api/modules/${moduleId}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: 'Question', back: 'Answer' }),
    });
    expect(response.status).toBe(201);
    const data = await response.json() as { front: string; back: string; module_id: number };
    expect(data.front).toBe('Question');
    expect(data.back).toBe('Answer');
    expect(data.module_id).toBe(moduleId);
  });

  it('POST /api/modules/:id/flashcards/bulk - should create multiple flashcards', async () => {
    const response = await SELF.fetch(`http://localhost/api/modules/${moduleId}/flashcards/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flashcards: [
          { front: 'Q1', back: 'A1' },
          { front: 'Q2', back: 'A2' },
        ],
      }),
    });
    expect(response.status).toBe(201);
    const data = await response.json() as { created: number };
    expect(data.created).toBe(2);
  });

  it('PUT /api/flashcards/:id - should update a flashcard', async () => {
    const createRes = await SELF.fetch(`http://localhost/api/modules/${moduleId}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: 'Old Q', back: 'Old A' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/flashcards/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: 'New Q', back: 'New A' }),
    });
    expect(response.status).toBe(200);
    const data = await response.json() as { front: string; back: string };
    expect(data.front).toBe('New Q');
    expect(data.back).toBe('New A');
  });

  it('DELETE /api/flashcards/:id - should delete a flashcard', async () => {
    const createRes = await SELF.fetch(`http://localhost/api/modules/${moduleId}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: 'To Delete', back: 'Answer' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/flashcards/${created.id}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(200);
  });
});

describe('FAQs API', () => {
  let moduleId: number;

  beforeEach(async () => {
    const projectRes = await SELF.fetch('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'FAQ Test Project' }),
    });
    const project = await projectRes.json() as { id: number };

    const moduleRes = await SELF.fetch(`http://localhost/api/projects/${project.id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'FAQ Test Module' }),
    });
    const module = await moduleRes.json() as { id: number };
    moduleId = module.id;
  });

  it('GET /api/modules/:id/faqs - should return empty list initially', async () => {
    const response = await SELF.fetch(`http://localhost/api/modules/${moduleId}/faqs`);
    expect(response.status).toBe(200);
    const data = await response.json() as unknown[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it('POST /api/modules/:id/faqs - should create a FAQ', async () => {
    const response = await SELF.fetch(`http://localhost/api/modules/${moduleId}/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is this?', answer: 'A test FAQ' }),
    });
    expect(response.status).toBe(201);
    const data = await response.json() as { question: string; answer: string; module_id: number };
    expect(data.question).toBe('What is this?');
    expect(data.answer).toBe('A test FAQ');
    expect(data.module_id).toBe(moduleId);
  });

  it('POST /api/modules/:id/faqs/bulk - should create multiple FAQs', async () => {
    const response = await SELF.fetch(`http://localhost/api/modules/${moduleId}/faqs/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        faqs: [
          { question: 'Q1?', answer: 'A1' },
          { question: 'Q2?', answer: 'A2' },
        ],
      }),
    });
    expect(response.status).toBe(201);
    const data = await response.json() as { created: number };
    expect(data.created).toBe(2);
  });

  it('PUT /api/faqs/:id - should update a FAQ', async () => {
    const createRes = await SELF.fetch(`http://localhost/api/modules/${moduleId}/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Old Q?', answer: 'Old A' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/faqs/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'New Q?', answer: 'New A' }),
    });
    expect(response.status).toBe(200);
    const data = await response.json() as { question: string; answer: string };
    expect(data.question).toBe('New Q?');
    expect(data.answer).toBe('New A');
  });

  it('DELETE /api/faqs/:id - should delete a FAQ', async () => {
    const createRes = await SELF.fetch(`http://localhost/api/modules/${moduleId}/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'To Delete?', answer: 'Answer' }),
    });
    const created = await createRes.json() as { id: number };

    const response = await SELF.fetch(`http://localhost/api/faqs/${created.id}`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(200);
  });
});
