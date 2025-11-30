/**
 * Database query functions for GTL
 *
 * This file contains all D1 database queries for projects, modules, flashcards, and FAQs.
 * Uses Cloudflare D1's prepared statement API for security and performance.
 */

import type {
  Project,
  Module,
  Flashcard,
  FAQ,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateModuleRequest,
  UpdateModuleRequest,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  CreateFAQRequest,
  UpdateFAQRequest
} from '../types';

// ============================================================================
// PROJECTS
// ============================================================================

export async function getAllProjects(db: D1Database): Promise<Project[]> {
  const result = await db.prepare(
    'SELECT * FROM projects ORDER BY created_at DESC'
  ).all<Project>();
  return result.results || [];
}

export async function getProjectById(db: D1Database, id: number): Promise<Project | null> {
  const result = await db.prepare(
    'SELECT * FROM projects WHERE id = ?'
  ).bind(id).first<Project>();
  return result;
}

export async function createProject(db: D1Database, data: CreateProjectRequest): Promise<Project> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db.prepare(
    'INSERT INTO projects (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)'
  ).bind(data.name, data.description || null, now, now).run();

  if (!result.success) {
    throw new Error('Failed to create project');
  }

  return {
    id: result.meta.last_row_id as number,
    name: data.name,
    description: data.description || null,
    created_at: now,
    updated_at: now,
  };
}

export async function updateProject(db: D1Database, id: number, data: UpdateProjectRequest): Promise<Project | null> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }

  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description ?? null);
  }

  if (updates.length === 0) {
    return getProjectById(db, id);
  }

  updates.push('updated_at = ?');
  values.push(Math.floor(Date.now() / 1000));
  values.push(id);

  const result = await db.prepare(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  if (result.meta.changes === 0) {
    return null;
  }

  return getProjectById(db, id);
}

export async function deleteProject(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM projects WHERE id = ?'
  ).bind(id).run();
  return result.success && (result.meta.changes || 0) > 0;
}

// ============================================================================
// MODULES
// ============================================================================

export async function getModulesByProject(db: D1Database, projectId: number): Promise<Module[]> {
  const result = await db.prepare(
    'SELECT * FROM modules WHERE project_id = ? ORDER BY sort_order ASC, created_at ASC'
  ).bind(projectId).all<Module>();
  return result.results || [];
}

export async function getModuleById(db: D1Database, id: number): Promise<Module | null> {
  const result = await db.prepare(
    'SELECT * FROM modules WHERE id = ?'
  ).bind(id).first<Module>();
  return result;
}

export async function getModuleWithCounts(db: D1Database, id: number) {
  const module = await getModuleById(db, id);
  if (!module) return null;

  const flashcardCount = await db.prepare(
    'SELECT COUNT(*) as count FROM flashcards WHERE module_id = ?'
  ).bind(id).first<{ count: number }>();

  const faqCount = await db.prepare(
    'SELECT COUNT(*) as count FROM faqs WHERE module_id = ?'
  ).bind(id).first<{ count: number }>();

  return {
    ...module,
    flashcard_count: flashcardCount?.count || 0,
    faq_count: faqCount?.count || 0
  };
}

export async function createModule(db: D1Database, projectId: number, data: CreateModuleRequest): Promise<Module> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db.prepare(
    'INSERT INTO modules (project_id, name, description, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    projectId,
    data.name,
    data.description ?? null,
    data.sort_order ?? 0,
    now,
    now
  ).run();

  if (!result.success) {
    throw new Error('Failed to create module');
  }

  return {
    id: result.meta.last_row_id as number,
    project_id: projectId,
    name: data.name,
    description: data.description ?? null,
    sort_order: data.sort_order ?? 0,
    created_at: now,
    updated_at: now,
  };
}

export async function updateModule(db: D1Database, id: number, data: UpdateModuleRequest): Promise<Module | null> {
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }

  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description ?? null);
  }

  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(data.sort_order);
  }

  if (updates.length === 0) {
    return getModuleById(db, id);
  }

  updates.push('updated_at = ?');
  values.push(Math.floor(Date.now() / 1000));
  values.push(id);

  const result = await db.prepare(
    `UPDATE modules SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  if (result.meta.changes === 0) {
    return null;
  }

  return getModuleById(db, id);
}

export async function deleteModule(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM modules WHERE id = ?'
  ).bind(id).run();
  return result.success && (result.meta.changes || 0) > 0;
}

// ============================================================================
// FLASHCARDS
// ============================================================================

export async function getFlashcardsByModule(db: D1Database, moduleId: number): Promise<Flashcard[]> {
  const result = await db.prepare(
    'SELECT * FROM flashcards WHERE module_id = ? ORDER BY created_at ASC'
  ).bind(moduleId).all<Flashcard>();
  return result.results || [];
}

export async function getFlashcardById(db: D1Database, id: number): Promise<Flashcard | null> {
  const result = await db.prepare(
    'SELECT * FROM flashcards WHERE id = ?'
  ).bind(id).first<Flashcard>();
  return result;
}

export async function createFlashcard(db: D1Database, moduleId: number, data: CreateFlashcardRequest): Promise<Flashcard> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db.prepare(
    'INSERT INTO flashcards (module_id, front, back, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(moduleId, data.front, data.back, now, now).run();

  if (!result.success) {
    throw new Error('Failed to create flashcard');
  }

  return {
    id: result.meta.last_row_id as number,
    module_id: moduleId,
    front: data.front,
    back: data.back,
    created_at: now,
    updated_at: now,
  };
}

export async function bulkCreateFlashcards(db: D1Database, moduleId: number, data: CreateFlashcardRequest[]): Promise<Flashcard[]> {
  const now = Math.floor(Date.now() / 1000);
  const flashcards: Flashcard[] = [];

  for (const item of data) {
    const result = await db.prepare(
      'INSERT INTO flashcards (module_id, front, back, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(moduleId, item.front, item.back, now, now).run();

    if (!result.success) {
      throw new Error('Failed to create flashcard in bulk operation');
    }

    flashcards.push({
      id: result.meta.last_row_id as number,
      module_id: moduleId,
      front: item.front,
      back: item.back,
      created_at: now,
      updated_at: now,
    });
  }

  return flashcards;
}

export async function updateFlashcard(db: D1Database, id: number, data: UpdateFlashcardRequest): Promise<Flashcard | null> {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.front !== undefined) {
    updates.push('front = ?');
    values.push(data.front);
  }

  if (data.back !== undefined) {
    updates.push('back = ?');
    values.push(data.back);
  }

  if (updates.length === 0) {
    return getFlashcardById(db, id);
  }

  updates.push('updated_at = ?');
  values.push(Math.floor(Date.now() / 1000));
  values.push(id);

  const result = await db.prepare(
    `UPDATE flashcards SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  if (result.meta.changes === 0) {
    return null;
  }

  return getFlashcardById(db, id);
}

export async function deleteFlashcard(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM flashcards WHERE id = ?'
  ).bind(id).run();
  return result.success && (result.meta.changes || 0) > 0;
}

// ============================================================================
// FAQs
// ============================================================================

export async function getFAQsByModule(db: D1Database, moduleId: number): Promise<FAQ[]> {
  const result = await db.prepare(
    'SELECT * FROM faqs WHERE module_id = ? ORDER BY created_at ASC'
  ).bind(moduleId).all<FAQ>();
  return result.results || [];
}

export async function getFAQById(db: D1Database, id: number): Promise<FAQ | null> {
  const result = await db.prepare(
    'SELECT * FROM faqs WHERE id = ?'
  ).bind(id).first<FAQ>();
  return result;
}

export async function createFAQ(db: D1Database, moduleId: number, data: CreateFAQRequest): Promise<FAQ> {
  const now = Math.floor(Date.now() / 1000);
  const result = await db.prepare(
    'INSERT INTO faqs (module_id, question, answer, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(moduleId, data.question, data.answer, now, now).run();

  if (!result.success) {
    throw new Error('Failed to create FAQ');
  }

  return {
    id: result.meta.last_row_id as number,
    module_id: moduleId,
    question: data.question,
    answer: data.answer,
    created_at: now,
    updated_at: now,
  };
}

export async function bulkCreateFAQs(db: D1Database, moduleId: number, data: CreateFAQRequest[]): Promise<FAQ[]> {
  const now = Math.floor(Date.now() / 1000);
  const faqs: FAQ[] = [];

  for (const item of data) {
    const result = await db.prepare(
      'INSERT INTO faqs (module_id, question, answer, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(moduleId, item.question, item.answer, now, now).run();

    if (!result.success) {
      throw new Error('Failed to create FAQ in bulk operation');
    }

    faqs.push({
      id: result.meta.last_row_id as number,
      module_id: moduleId,
      question: item.question,
      answer: item.answer,
      created_at: now,
      updated_at: now,
    });
  }

  return faqs;
}

export async function updateFAQ(db: D1Database, id: number, data: UpdateFAQRequest): Promise<FAQ | null> {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.question !== undefined) {
    updates.push('question = ?');
    values.push(data.question);
  }

  if (data.answer !== undefined) {
    updates.push('answer = ?');
    values.push(data.answer);
  }

  if (updates.length === 0) {
    return getFAQById(db, id);
  }

  updates.push('updated_at = ?');
  values.push(Math.floor(Date.now() / 1000));
  values.push(id);

  const result = await db.prepare(
    `UPDATE faqs SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  if (result.meta.changes === 0) {
    return null;
  }

  return getFAQById(db, id);
}

export async function deleteFAQ(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM faqs WHERE id = ?'
  ).bind(id).run();
  return result.success && (result.meta.changes || 0) > 0;
}
