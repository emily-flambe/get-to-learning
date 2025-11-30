/**
 * Modules API Routes
 *
 * Handles CRUD operations for modules within projects
 */

import { Hono } from 'hono';
import type { Env, CreateModuleRequest, UpdateModuleRequest } from '../types';
import * as db from '../db/queries';

const app = new Hono<{ Bindings: Env }>();

// GET /api/projects/:projectId/modules - List modules in project
app.get('/projects/:projectId/modules', async (c) => {
  try {
    const projectId = parseInt(c.req.param('projectId'));
    if (isNaN(projectId)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    // Verify project exists
    const project = await db.getProjectById(c.env.DB, projectId);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const modules = await db.getModulesByProject(c.env.DB, projectId);
    return c.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return c.json({ error: 'Failed to fetch modules' }, 500);
  }
});

// GET /api/modules/:id - Get module with content counts
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid module ID' }, 400);
    }

    const module = await db.getModuleWithCounts(c.env.DB, id);
    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    return c.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    return c.json({ error: 'Failed to fetch module' }, 500);
  }
});

// POST /api/projects/:projectId/modules - Create module
app.post('/projects/:projectId/modules', async (c) => {
  try {
    const projectId = parseInt(c.req.param('projectId'));
    if (isNaN(projectId)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    // Verify project exists
    const project = await db.getProjectById(c.env.DB, projectId);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const body = await c.req.json<CreateModuleRequest>();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return c.json({ error: 'Module name is required' }, 400);
    }

    const module = await db.createModule(c.env.DB, projectId, {
      name: body.name.trim(),
      description: body.description,
      sort_order: body.sort_order
    });

    return c.json(module, 201);
  } catch (error) {
    console.error('Error creating module:', error);
    return c.json({ error: 'Failed to create module' }, 500);
  }
});

// PUT /api/modules/:id - Update module
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid module ID' }, 400);
    }

    const body = await c.req.json<UpdateModuleRequest>();

    // Validate fields if provided
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      return c.json({ error: 'Module name cannot be empty' }, 400);
    }

    if (body.sort_order !== undefined && (typeof body.sort_order !== 'number' || body.sort_order < 0)) {
      return c.json({ error: 'Sort order must be a non-negative number' }, 400);
    }

    const module = await db.updateModule(c.env.DB, id, body);
    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    return c.json(module);
  } catch (error) {
    console.error('Error updating module:', error);
    return c.json({ error: 'Failed to update module' }, 500);
  }
});

// DELETE /api/modules/:id - Delete module
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid module ID' }, 400);
    }

    const deleted = await db.deleteModule(c.env.DB, id);
    if (!deleted) {
      return c.json({ error: 'Module not found' }, 404);
    }

    return c.json({ success: true, message: 'Module deleted' });
  } catch (error) {
    console.error('Error deleting module:', error);
    return c.json({ error: 'Failed to delete module' }, 500);
  }
});

export default app;
