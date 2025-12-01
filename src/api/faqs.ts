/**
 * Questions API Routes (formerly FAQs)
 *
 * Handles CRUD operations for questions within modules
 * Questions can have tags for filtering
 */

import { Hono } from 'hono';
import type { Env, CreateFAQRequest, BulkCreateFAQsRequest, UpdateFAQRequest } from '../types';
import * as db from '../db/queries';

const app = new Hono<{ Bindings: Env }>();

// Extended request types with tags
interface CreateQuestionRequest extends CreateFAQRequest {
  tags?: string[];
}

interface BulkCreateQuestionsRequest {
  questions: CreateQuestionRequest[];
}

interface UpdateQuestionRequest extends UpdateFAQRequest {
  tags?: string[];
}

// GET /api/modules/:moduleId/faqs - List questions in module
app.get('/modules/:moduleId/faqs', async (c) => {
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

    const questions = await db.getQuestionsByModule(c.env.DB, moduleId);
    return c.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return c.json({ error: 'Failed to fetch questions' }, 500);
  }
});

// POST /api/modules/:moduleId/faqs - Create single question
app.post('/modules/:moduleId/faqs', async (c) => {
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

    const body = await c.req.json<CreateQuestionRequest>();

    // Validate required fields
    if (!body.question || typeof body.question !== 'string' || body.question.trim().length === 0) {
      return c.json({ error: 'Question text is required' }, 400);
    }
    if (!body.answer || typeof body.answer !== 'string' || body.answer.trim().length === 0) {
      return c.json({ error: 'Answer is required' }, 400);
    }

    // Validate tags if provided
    if (body.tags !== undefined && !Array.isArray(body.tags)) {
      return c.json({ error: 'Tags must be an array' }, 400);
    }

    const question = await db.createQuestion(c.env.DB, moduleId, {
      question: body.question.trim(),
      answer: body.answer.trim(),
      tags: body.tags || []
    });

    return c.json(question, 201);
  } catch (error) {
    console.error('Error creating question:', error);
    return c.json({ error: 'Failed to create question' }, 500);
  }
});

// POST /api/modules/:moduleId/faqs/bulk - Bulk create questions
app.post('/modules/:moduleId/faqs/bulk', async (c) => {
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

    const body = await c.req.json<BulkCreateQuestionsRequest>();

    // Support both 'faqs' and 'questions' keys for backwards compatibility
    const items = (body as any).questions || (body as any).faqs;
    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'Questions array is required and cannot be empty' }, 400);
    }

    // Validate each question
    for (let i = 0; i < items.length; i++) {
      const q = items[i];
      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        return c.json({ error: `Question ${i + 1}: question text is required` }, 400);
      }
      if (!q.answer || typeof q.answer !== 'string' || q.answer.trim().length === 0) {
        return c.json({ error: `Question ${i + 1}: answer is required` }, 400);
      }
      if (q.tags !== undefined && !Array.isArray(q.tags)) {
        return c.json({ error: `Question ${i + 1}: tags must be an array` }, 400);
      }
    }

    const questions = await db.bulkCreateQuestions(c.env.DB, moduleId, items);

    return c.json({
      success: true,
      created: questions.length,
      questions
    }, 201);
  } catch (error) {
    console.error('Error bulk creating questions:', error);
    return c.json({ error: 'Failed to bulk create questions' }, 500);
  }
});

// PUT /api/faqs/:id - Update question
app.put('/faqs/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid question ID' }, 400);
    }

    const body = await c.req.json<UpdateQuestionRequest>();

    // Validate fields if provided
    if (body.question !== undefined && (typeof body.question !== 'string' || body.question.trim().length === 0)) {
      return c.json({ error: 'Question text cannot be empty' }, 400);
    }
    if (body.answer !== undefined && (typeof body.answer !== 'string' || body.answer.trim().length === 0)) {
      return c.json({ error: 'Answer cannot be empty' }, 400);
    }
    if (body.tags !== undefined && !Array.isArray(body.tags)) {
      return c.json({ error: 'Tags must be an array' }, 400);
    }

    const question = await db.updateQuestion(c.env.DB, id, body);
    if (!question) {
      return c.json({ error: 'Question not found' }, 404);
    }

    return c.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return c.json({ error: 'Failed to update question' }, 500);
  }
});

// DELETE /api/faqs/:id - Delete question
app.delete('/faqs/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid question ID' }, 400);
    }

    const deleted = await db.deleteQuestion(c.env.DB, id);
    if (!deleted) {
      return c.json({ error: 'Question not found' }, 404);
    }

    return c.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return c.json({ error: 'Failed to delete question' }, 500);
  }
});

export default app;
