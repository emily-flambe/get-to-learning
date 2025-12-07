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

// GET /api/projects/:id/flashcards - Get flashcards for project modules
app.get('/:id/flashcards', async (c) => {
  try {
    const projectId = parseInt(c.req.param('id'));
    if (isNaN(projectId)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    // Verify project exists
    const project = await db.getProjectById(c.env.DB, projectId);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get modules parameter (comma-separated list of module IDs)
    const modulesParam = c.req.query('modules');
    let moduleIds: number[] = [];

    if (modulesParam) {
      // Parse and validate module IDs
      const ids = modulesParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      if (ids.length === 0) {
        return c.json({ error: 'Invalid modules parameter' }, 400);
      }

      // Verify all modules belong to this project
      const projectModules = await db.getModulesByProject(c.env.DB, projectId);
      const validModuleIds = new Set(projectModules.map(m => m.id));

      const invalidModules = ids.filter(id => !validModuleIds.has(id));
      if (invalidModules.length > 0) {
        return c.json({
          error: 'Invalid module IDs',
          invalid_modules: invalidModules
        }, 400);
      }

      moduleIds = ids;
    } else {
      // No modules param - return flashcards from ALL modules in project
      const projectModules = await db.getModulesByProject(c.env.DB, projectId);
      moduleIds = projectModules.map(m => m.id);
    }

    // Fetch flashcards for the selected modules
    const flashcards = await db.getFlashcardsByModules(c.env.DB, moduleIds);
    return c.json(flashcards);

  } catch (error) {
    console.error('Error fetching project flashcards:', error);
    return c.json({ error: 'Failed to fetch flashcards' }, 500);
  }
});

// GET /api/projects/:id/faqs - Get FAQs for project modules
app.get('/:id/faqs', async (c) => {
  try {
    const projectId = parseInt(c.req.param('id'));
    if (isNaN(projectId)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }

    // Verify project exists
    const project = await db.getProjectById(c.env.DB, projectId);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Get modules parameter (comma-separated list of module IDs)
    const modulesParam = c.req.query('modules');
    let moduleIds: number[] = [];

    if (modulesParam) {
      // Parse and validate module IDs
      const ids = modulesParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      if (ids.length === 0) {
        return c.json({ error: 'Invalid modules parameter' }, 400);
      }

      // Verify all modules belong to this project
      const projectModules = await db.getModulesByProject(c.env.DB, projectId);
      const validModuleIds = new Set(projectModules.map(m => m.id));

      const invalidModules = ids.filter(id => !validModuleIds.has(id));
      if (invalidModules.length > 0) {
        return c.json({
          error: 'Invalid module IDs',
          invalid_modules: invalidModules
        }, 400);
      }

      moduleIds = ids;
    } else {
      // No modules param - return FAQs from ALL modules in project
      const projectModules = await db.getModulesByProject(c.env.DB, projectId);
      moduleIds = projectModules.map(m => m.id);
    }

    // Fetch FAQs for the selected modules
    const faqs = await db.getQuestionsByModules(c.env.DB, moduleIds);
    return c.json(faqs);

  } catch (error) {
    console.error('Error fetching project FAQs:', error);
    return c.json({ error: 'Failed to fetch FAQs' }, 500);
  }
});

export default app;
