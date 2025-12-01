-- Migration: Add tags column to faqs table
-- Tags are stored as a JSON array string, e.g., '["B-Tree","Chapter 4"]'

ALTER TABLE faqs ADD COLUMN tags TEXT DEFAULT '[]';
