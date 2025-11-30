/**
 * GTL (Get To Learning) - Personal Learning Platform
 *
 * Cloudflare Worker API using Hono framework with D1 database
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

// Create Hono app with typed bindings
const app = new Hono<{ Bindings: Env }>();

// CORS middleware - allow all origins for personal use
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'GTL API is running'
  });
});

// Placeholder routes - to be implemented by subagents
app.get('/api/projects', (c) => {
  return c.json({ message: 'Projects endpoint - to be implemented' });
});

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
