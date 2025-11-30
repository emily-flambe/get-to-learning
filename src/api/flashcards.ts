/**
 * Flashcards API Routes
 *
 * Handles CRUD operations for flashcards within modules
 */

import { Hono } from 'hono';
import type { Env, CreateFlashcardRequest, BulkCreateFlashcardsRequest, UpdateFlashcardRequest } from '../types';
import * as db from '../db/queries';

const app = new Hono<{ Bindings: Env }>();

// GET /api/modules/:moduleId/flashcards - List flashcards in module
app.get('/modules/:moduleId/flashcards', async (c) => {
  try {
    const moduleId = parseInt(c.req.param('moduleId'));
    if (isNaN(moduleId)) {
      return c.json({ error: 'Invalid module ID' }, 400);
    }

    // Verify module exists
    const module = await db.getModuleById(c.env.DB, moduleId);
    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    const flashcards = await db.getFlashcardsByModule(c.env.DB, moduleId);
    return c.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return c.json({ error: 'Failed to fetch flashcards' }, 500);
  }
});

// POST /api/modules/:moduleId/flashcards - Create single flashcard
app.post('/modules/:moduleId/flashcards', async (c) => {
  try {
    const moduleId = parseInt(c.req.param('moduleId'));
    if (isNaN(moduleId)) {
      return c.json({ error: 'Invalid module ID' }, 400);
    }

    // Verify module exists
    const module = await db.getModuleById(c.env.DB, moduleId);
    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    const body = await c.req.json<CreateFlashcardRequest>();

    // Validate required fields
    if (!body.front || typeof body.front !== 'string' || body.front.trim().length === 0) {
      return c.json({ error: 'Flashcard front is required' }, 400);
    }
    if (!body.back || typeof body.back !== 'string' || body.back.trim().length === 0) {
      return c.json({ error: 'Flashcard back is required' }, 400);
    }

    const flashcard = await db.createFlashcard(c.env.DB, moduleId, {
      front: body.front.trim(),
      back: body.back.trim()
    });

    return c.json(flashcard, 201);
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return c.json({ error: 'Failed to create flashcard' }, 500);
  }
});

// POST /api/modules/:moduleId/flashcards/bulk - Bulk create flashcards
app.post('/modules/:moduleId/flashcards/bulk', async (c) => {
  try {
    const moduleId = parseInt(c.req.param('moduleId'));
    if (isNaN(moduleId)) {
      return c.json({ error: 'Invalid module ID' }, 400);
    }

    // Verify module exists
    const module = await db.getModuleById(c.env.DB, moduleId);
    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    const body = await c.req.json<BulkCreateFlashcardsRequest>();

    // Validate input
    if (!Array.isArray(body.flashcards) || body.flashcards.length === 0) {
      return c.json({ error: 'Flashcards array is required and cannot be empty' }, 400);
    }

    // Validate each flashcard
    for (let i = 0; i < body.flashcards.length; i++) {
      const card = body.flashcards[i];
      if (!card.front || typeof card.front !== 'string' || card.front.trim().length === 0) {
        return c.json({ error: `Flashcard ${i + 1}: front is required` }, 400);
      }
      if (!card.back || typeof card.back !== 'string' || card.back.trim().length === 0) {
        return c.json({ error: `Flashcard ${i + 1}: back is required` }, 400);
      }
    }

    const flashcards = await db.bulkCreateFlashcards(c.env.DB, moduleId, body.flashcards);

    return c.json({
      success: true,
      created: flashcards.length,
      flashcards
    }, 201);
  } catch (error) {
    console.error('Error bulk creating flashcards:', error);
    return c.json({ error: 'Failed to bulk create flashcards' }, 500);
  }
});

// PUT /api/flashcards/:id - Update flashcard
app.put('/flashcards/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid flashcard ID' }, 400);
    }

    const body = await c.req.json<UpdateFlashcardRequest>();

    // Validate fields if provided
    if (body.front !== undefined && (typeof body.front !== 'string' || body.front.trim().length === 0)) {
      return c.json({ error: 'Flashcard front cannot be empty' }, 400);
    }
    if (body.back !== undefined && (typeof body.back !== 'string' || body.back.trim().length === 0)) {
      return c.json({ error: 'Flashcard back cannot be empty' }, 400);
    }

    const flashcard = await db.updateFlashcard(c.env.DB, id, body);
    if (!flashcard) {
      return c.json({ error: 'Flashcard not found' }, 404);
    }

    return c.json(flashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    return c.json({ error: 'Failed to update flashcard' }, 500);
  }
});

// DELETE /api/flashcards/:id - Delete flashcard
app.delete('/flashcards/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid flashcard ID' }, 400);
    }

    const deleted = await db.deleteFlashcard(c.env.DB, id);
    if (!deleted) {
      return c.json({ error: 'Flashcard not found' }, 404);
    }

    return c.json({ success: true, message: 'Flashcard deleted' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return c.json({ error: 'Failed to delete flashcard' }, 500);
  }
});

export default app;
