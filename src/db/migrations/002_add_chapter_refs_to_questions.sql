-- Add chapter/section references to question answers
-- Based on "Database Internals" by Alex Petrov, Chapters 4-6

-- Q2: Page header
UPDATE faqs SET answer = answer || '

See: Chapter 4, "Page Header" section' WHERE id = 2;

-- Q3: Sibling links
UPDATE faqs SET answer = answer || '

See: Chapter 4, "Sibling Links" section' WHERE id = 3;

-- Q4: High keys / Blink-tree
UPDATE faqs SET answer = answer || '

See: Chapter 4, "Node High Keys" section and Chapter 5, "Blink-Trees" section' WHERE id = 4;

-- Q5: Overflow pages
UPDATE faqs SET answer = answer || '

See: Chapter 4, "Overflow Pages" section' WHERE id = 5;

-- Q6: Breadcrumbs
UPDATE faqs SET answer = answer || '

See: Chapter 4, "Breadcrumbs" section' WHERE id = 6;

-- Q7: Latches vs locks
UPDATE faqs SET answer = answer || '

See: Chapter 5, "Locks" and "Latches" sections' WHERE id = 7;

-- Q8: Steal and force policies
UPDATE faqs SET answer = answer || '

See: Chapter 5, "Steal and Force Policies" section' WHERE id = 8;

-- Q9: ARIES recovery
UPDATE faqs SET answer = answer || '

See: Chapter 5, "ARIES" section' WHERE id = 9;

-- Q10: Write skew
UPDATE faqs SET answer = answer || '

See: Chapter 5, "Read and Write Anomalies" section' WHERE id = 10;

-- Q11: Read committed / repeatable read
UPDATE faqs SET answer = answer || '

See: Chapter 5, "Isolation Levels" section' WHERE id = 11;

-- Q12: MVCC / snapshot isolation
UPDATE faqs SET answer = answer || '

See: Chapter 5, "Multiversion Concurrency Control" and "Isolation Levels" sections' WHERE id = 12;

-- Q13: Checkpointing
UPDATE faqs SET answer = answer || '

See: Chapter 5, "Recovery" section (Checkpoints discussion)' WHERE id = 13;

-- Q14: Copy-on-write / LMDB
UPDATE faqs SET answer = answer || '

See: Chapter 6, "Copy-on-Write" and "Implementing Copy-on-Write: LMDB" sections' WHERE id = 14;

-- Q15: Lazy B-trees
UPDATE faqs SET answer = answer || '

See: Chapter 6, "Lazy B-Trees" section (covers WiredTiger and LA-Trees)' WHERE id = 15;

-- Q16: Bw-Trees
UPDATE faqs SET answer = answer || '

See: Chapter 6, "Bw-Trees" section' WHERE id = 16;

-- Q17: Write amplification
UPDATE faqs SET answer = answer || '

See: Chapter 6, "Bw-Trees" section (opens with write amplification discussion)' WHERE id = 17;

-- Q18: Fractional cascading / FD-Tree
UPDATE faqs SET answer = answer || '

See: Chapter 6, "FD-Trees" and "Fractional Cascading" sections' WHERE id = 18;
