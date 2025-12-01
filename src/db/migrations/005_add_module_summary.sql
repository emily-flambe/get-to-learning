-- Add summary field to modules table

ALTER TABLE modules ADD COLUMN summary TEXT;

-- Populate summary for module 2 (Database Internals Chapters 4-6)
-- Note: Remote DB has module ID 2, local has ID 3
UPDATE modules SET summary = '## Chapter 4: B-Tree Implementation

**Core insight:** B-Trees are about navigating and maintaining a sorted structure on disk. Everything (page headers, sibling links, breadcrumbs) exists to make traversal and modification efficient.

**Key concepts:**
- **Page headers** store metadata for quick page interpretation
- **Sibling links** enable fast range scans without parent traversal
- **High keys** (Blink-trees) allow safe concurrent navigation during splits
- **Breadcrumbs** track traversal path for split/merge propagation

---

## Chapter 5: Transaction Processing & Recovery

**Core insight:** The fundamental tension is between performance (batching writes, caching) and durability (not losing committed data). WAL + page cache + checkpoints is the elegant solution.

**Key concepts:**
- **Latches vs locks:** Internal structure protection vs. transaction-level data protection
- **Steal/no-force:** Flexible buffer management requiring WAL for recovery
- **ARIES:** Three-phase recovery (Analysis, Redo, Undo) enabling steal/no-force
- **MVCC:** Multiple versions let readers and writers work concurrently
- **Isolation levels:** Trade consistency guarantees for performance

---

## Chapter 6: B-Tree Variants

**Core insight:** Every B-Tree variant trades off something (write amplification, read complexity, space) to optimize for a specific workload.

**Key concepts:**
- **Copy-on-write:** Never modify pages in place; instant recovery, no WAL needed
- **Lazy B-Trees:** Buffer updates in internal nodes; batch writes to reduce I/O
- **Bw-Trees:** Lock-free operations via delta chains and CAS
- **Write amplification:** The hidden cost of modifying data on disk
- **Fractional cascading:** Shortcuts between levels for faster multi-level search' WHERE id = 3;
