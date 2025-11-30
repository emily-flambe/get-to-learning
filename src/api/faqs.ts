/**
 * FAQs API Routes
 *
 * Handles CRUD operations for FAQs within modules
 */

import { Hono } from 'hono';
import type { Env, CreateFAQRequest, BulkCreateFAQsRequest, UpdateFAQRequest } from '../types';
import * as db from '../db/queries';

const app = new Hono<{ Bindings: Env }>();

// GET /api/modules/:moduleId/faqs - List FAQs in module
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

    const faqs = await db.getFAQsByModule(c.env.DB, moduleId);
    return c.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return c.json({ error: 'Failed to fetch FAQs' }, 500);
  }
});

// POST /api/modules/:moduleId/faqs - Create single FAQ
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

    const body = await c.req.json<CreateFAQRequest>();

    // Validate required fields
    if (!body.question || typeof body.question !== 'string' || body.question.trim().length === 0) {
      return c.json({ error: 'FAQ question is required' }, 400);
    }
    if (!body.answer || typeof body.answer !== 'string' || body.answer.trim().length === 0) {
      return c.json({ error: 'FAQ answer is required' }, 400);
    }

    const faq = await db.createFAQ(c.env.DB, moduleId, {
      question: body.question.trim(),
      answer: body.answer.trim()
    });

    return c.json(faq, 201);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return c.json({ error: 'Failed to create FAQ' }, 500);
  }
});

// POST /api/modules/:moduleId/faqs/bulk - Bulk create FAQs
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

    const body = await c.req.json<BulkCreateFAQsRequest>();

    // Validate input
    if (!Array.isArray(body.faqs) || body.faqs.length === 0) {
      return c.json({ error: 'FAQs array is required and cannot be empty' }, 400);
    }

    // Validate each FAQ
    for (let i = 0; i < body.faqs.length; i++) {
      const faq = body.faqs[i];
      if (!faq.question || typeof faq.question !== 'string' || faq.question.trim().length === 0) {
        return c.json({ error: `FAQ ${i + 1}: question is required` }, 400);
      }
      if (!faq.answer || typeof faq.answer !== 'string' || faq.answer.trim().length === 0) {
        return c.json({ error: `FAQ ${i + 1}: answer is required` }, 400);
      }
    }

    const faqs = await db.bulkCreateFAQs(c.env.DB, moduleId, body.faqs);

    return c.json({
      success: true,
      count: faqs.length,
      faqs
    }, 201);
  } catch (error) {
    console.error('Error bulk creating FAQs:', error);
    return c.json({ error: 'Failed to bulk create FAQs' }, 500);
  }
});

// PUT /api/faqs/:id - Update FAQ
app.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid FAQ ID' }, 400);
    }

    const body = await c.req.json<UpdateFAQRequest>();

    // Validate fields if provided
    if (body.question !== undefined && (typeof body.question !== 'string' || body.question.trim().length === 0)) {
      return c.json({ error: 'FAQ question cannot be empty' }, 400);
    }
    if (body.answer !== undefined && (typeof body.answer !== 'string' || body.answer.trim().length === 0)) {
      return c.json({ error: 'FAQ answer cannot be empty' }, 400);
    }

    const faq = await db.updateFAQ(c.env.DB, id, body);
    if (!faq) {
      return c.json({ error: 'FAQ not found' }, 404);
    }

    return c.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return c.json({ error: 'Failed to update FAQ' }, 500);
  }
});

// DELETE /api/faqs/:id - Delete FAQ
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid FAQ ID' }, 400);
    }

    const deleted = await db.deleteFAQ(c.env.DB, id);
    if (!deleted) {
      return c.json({ error: 'FAQ not found' }, 404);
    }

    return c.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return c.json({ error: 'Failed to delete FAQ' }, 500);
  }
});

export default app;
