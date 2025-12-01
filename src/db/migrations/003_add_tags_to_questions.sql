-- Add tags to questions (sync from local to remote)
-- Remote IDs are offset by -1 from local IDs

UPDATE faqs SET tags = '["Chapter 4", "B-Tree", "Page Header"]' WHERE id = 2;
UPDATE faqs SET tags = '["Chapter 4", "B-Tree", "Sibling Links"]' WHERE id = 3;
UPDATE faqs SET tags = '["Chapter 4", "B-Tree", "Blink-Trees", "High Keys", "Concurrency"]' WHERE id = 4;
UPDATE faqs SET tags = '["Chapter 4", "B-Tree", "Overflow Pages"]' WHERE id = 5;
UPDATE faqs SET tags = '["Chapter 4", "B-Tree", "Breadcrumbs", "Splits and Merges"]' WHERE id = 6;
UPDATE faqs SET tags = '["Chapter 5", "Concurrency", "Latches", "Locks"]' WHERE id = 7;
UPDATE faqs SET tags = '["Chapter 5", "Buffer Management", "Steal/Force", "Page Cache"]' WHERE id = 8;
UPDATE faqs SET tags = '["Chapter 5", "Recovery", "ARIES", "WAL"]' WHERE id = 9;
UPDATE faqs SET tags = '["Chapter 5", "Concurrency", "Isolation Levels", "Write Skew"]' WHERE id = 10;
UPDATE faqs SET tags = '["Chapter 5", "Isolation Levels", "Concurrency"]' WHERE id = 11;
UPDATE faqs SET tags = '["Chapter 5", "MVCC", "Snapshot Isolation", "Concurrency"]' WHERE id = 12;
UPDATE faqs SET tags = '["Chapter 5", "Recovery", "Checkpointing", "WAL"]' WHERE id = 13;
UPDATE faqs SET tags = '["Chapter 6", "Copy-on-Write", "LMDB", "B-Tree Variants"]' WHERE id = 14;
UPDATE faqs SET tags = '["Chapter 6", "Lazy B-Trees", "WiredTiger", "Write Amplification"]' WHERE id = 15;
UPDATE faqs SET tags = '["Chapter 6", "Bw-Trees", "Lock-Free", "Concurrency"]' WHERE id = 16;
UPDATE faqs SET tags = '["Chapter 6", "Write Amplification", "B-Tree Performance"]' WHERE id = 17;
UPDATE faqs SET tags = '["Chapter 6", "FD-Trees", "Fractional Cascading"]' WHERE id = 18;
