/**
 * GTL (Get To Learning) - Personal Learning Platform
 *
 * Cloudflare Worker API using Hono framework with D1 database
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

// Import API route modules
import projects from './api/projects';
import modules from './api/modules';
import flashcards from './api/flashcards';
import faqs from './api/faqs';

// Create Hono app with typed bindings
const app = new Hono<{ Bindings: Env }>();

// CORS middleware - allow all origins for personal use
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Password protection for DELETE requests
app.use('*', async (c, next) => {
  if (c.req.method === 'DELETE') {
    const password = c.req.header('X-Delete-Password');
    const expectedPassword = c.env.DELETE_PASSWORD || 'hunter2';
    if (password !== expectedPassword) {
      return c.json({ error: 'Invalid password' }, 401);
    }
  }
  await next();
});

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'GTL API is running'
  });
});

// Mount API routes
app.route('/api/projects', projects);
app.route('/api', modules);
app.route('/api', flashcards);
app.route('/api', faqs);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
