// Data models

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}

export interface Module {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  summary: string | null;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface Flashcard {
  id: number;
  module_id: number;
  front: string;
  back: string;
  created_at: number;
  updated_at: number;
}

export interface Question {
  id: number;
  module_id: number;
  question: string;
  answer: string;
  tags: string[];
  created_at: number;
  updated_at: number;
}

// Keep FAQ as alias for backwards compatibility
export type FAQ = Question;

// API request types

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface CreateModuleRequest {
  name: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateModuleRequest {
  name?: string;
  description?: string;
  summary?: string;
  sort_order?: number;
}

export interface CreateFlashcardRequest {
  front: string;
  back: string;
}

export interface BulkCreateFlashcardsRequest {
  flashcards: CreateFlashcardRequest[];
}

export interface UpdateFlashcardRequest {
  front?: string;
  back?: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
}

export interface BulkCreateFAQsRequest {
  faqs: CreateFAQRequest[];
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
}

// Cloudflare bindings

export interface Env {
  DB: D1Database;
  DELETE_PASSWORD: string;
}
