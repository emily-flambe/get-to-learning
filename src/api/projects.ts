/**
 * Projects API Routes
 *
 * Handles CRUD operations for projects
 */

import { Hono } from 'hono';
import type { Env, CreateProjectRequest, UpdateProjectRequest } from '../types';
import * as db from '../db/queries';

const app = new Hono<{ Bindings: Env }>();

// GET /api/projects - List all projects
app.get('/', async (c) => {
  try {
    const projects = await db.getAllProjects(c.env.DB);
    return c.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

// GET /api/projects/:id - Get single project with modules
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    const project = await db.getProjectById(c.env.DB, id);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Fetch modules for this project
    const modules = await db.getModulesByProject(c.env.DB, id);

    return c.json({
      ...project,
      modules
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

// POST /api/projects - Create project
app.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateProjectRequest>();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return c.json({ error: 'Project name is required' }, 400);
    }

    const project = await db.createProject(c.env.DB, {
      name: body.name.trim(),
      description: body.description
    });

    return c.json(project, 201);
  } catch (error) {
    console.error('Error creating project:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// PUT /api/projects/:id - Update project
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    const body = await c.req.json<UpdateProjectRequest>();

    // Validate fields if provided
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      return c.json({ error: 'Project name cannot be empty' }, 400);
    }

    const project = await db.updateProject(c.env.DB, id, body);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// DELETE /api/projects/:id - Delete project
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    const deleted = await db.deleteProject(c.env.DB, id);
    if (!deleted) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

export default app;
