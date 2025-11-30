-- Database Internals Book Club Content
-- Chapters 4-6: B-Trees, Transactions & Variants

-- Insert project
INSERT OR IGNORE INTO projects (name, description, created_at, updated_at)
VALUES ('Database Internals', 'O''Reilly book by Alex Petrov - Book Club Study Material', 1764534308, 1764534308);

-- Get the project ID (will be used by the app)
-- Insert module
INSERT OR IGNORE INTO modules (project_id, name, description, sort_order, created_at, updated_at)
SELECT id, 'Chapters 4-6: B-Trees, Transactions & Variants', 'Implementing B-Trees, Transaction Processing and Recovery, B-Tree Variants', 1, 1764534318, 1764534318
FROM projects WHERE name = 'Database Internals';

-- Insert flashcards (acronyms)
INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'WAL', 'Write-Ahead Log - A technique where all modifications are written to a log before being applied to the database pages. Guarantees durability and enables crash recovery.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'LSN', 'Log Sequence Number - A unique, monotonically increasing identifier assigned to each log record. Used to track which changes have been applied and for recovery ordering.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'CLR', 'Compensation Log Record - A log record written during undo operations that describes how to reverse a previously logged action. Ensures idempotent recovery.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'ARIES', 'Algorithm for Recovery and Isolation Exploiting Semantics - A widely-used recovery algorithm that uses WAL, LSNs, and CLRs to provide crash recovery with three phases: analysis, redo, and undo.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'ACID', 'Atomicity, Consistency, Isolation, Durability - The four properties that guarantee reliable database transactions.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'MVCC', 'Multiversion Concurrency Control - A concurrency control method that maintains multiple versions of data items, allowing readers to access consistent snapshots without blocking writers.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'OCC', 'Optimistic Concurrency Control - A concurrency control method that allows transactions to proceed without acquiring locks, validating for conflicts only at commit time.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'PCC', 'Pessimistic Concurrency Control - A concurrency control method that acquires locks upfront to prevent conflicts before they occur.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, '2PL', 'Two-Phase Locking - A locking protocol with two phases: growing (acquiring locks) and shrinking (releasing locks). Once a lock is released, no new locks can be acquired.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'SMO', 'Structure Modification Operation - Operations that modify the B-tree structure itself, such as page splits and merges. Require special handling for concurrency.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'FIFO', 'First In, First Out - A page eviction policy where the oldest cached pages are evicted first. Simple but may evict frequently accessed pages.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'LRU', 'Least Recently Used - A page eviction policy that evicts pages that have not been accessed for the longest time. Balances recency of access.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'LFU', 'Least Frequently Used - A page eviction policy that evicts pages with the lowest access count. Favors historically popular pages.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'RW Lock', 'Readers-Writer Lock - A synchronization primitive allowing multiple concurrent readers OR a single exclusive writer. Used for B-tree node access.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'LMDB', 'Lightning Memory-Mapped Database - A B-tree variant using copy-on-write and memory-mapped files. Provides lock-free reads and ACID transactions with a single-writer model.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'FD-Tree', 'Flash Disk Tree - A B-tree variant optimized for flash storage that uses fractional cascading to reduce write amplification.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'LA-Tree', 'Lazy-Adaptive Tree - A B-tree variant (used in WiredTiger) that buffers updates in internal nodes to reduce random I/O. Also called a lazy B-tree.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO flashcards (module_id, front, back, created_at, updated_at)
SELECT m.id, 'Bw-Tree', 'Buzzword Tree (informal name) - A lock-free B-tree variant developed by Microsoft that uses delta records and compare-and-swap operations for updates.', 1764534343, 1764534343
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

-- Insert FAQs
INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is a page header in a B-tree implementation and what does it typically contain?', 'A page header is a fixed-size area at the beginning of each B-tree page that stores metadata about the page. It typically contains: the page type (leaf, internal, or root), the number of cells/keys stored, free space information, sibling pointers, the rightmost child pointer (for internal nodes), and a magic number for validation. The header allows the storage engine to interpret and navigate the page contents correctly.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is the purpose of sibling links in B-trees?', 'Sibling links are forward (and sometimes backward) pointers connecting leaf nodes at the same level. They enable efficient range scans by allowing sequential traversal of leaf pages without returning to parent nodes. This is critical for queries that need to iterate over a range of keys, as the traversal can follow sibling pointers directly from leaf to leaf.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'How do high keys (Blink-tree optimization) improve B-tree concurrency?', 'High keys store the highest key that can be found in a node. During concurrent access, if a search finds a key larger than the node high key, it knows the target must be in the right sibling (reached via the sibling pointer). This allows safe navigation even during splits, as the searcher can catch up to the correct node without holding locks on parent nodes.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is the difference between overflow pages and separate pointer pages?', 'Overflow pages handle variable-length values that exceed the available cell space by linking additional pages to store the overflow data. Separate pointer pages are used to completely separate keys from their associated values, storing only pointers in the B-tree and putting actual values elsewhere. The choice depends on whether values are typically large (use overflow) or whether key-value separation provides better cache efficiency.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What are breadcrumbs in B-tree traversal and why are they useful?', 'Breadcrumbs are a record of the path taken during B-tree traversal from root to leaf, storing references to each visited node and the index of the child pointer followed. They are essential for split/merge propagation, allowing the operation to walk back up the tree to update parent nodes after a leaf modification causes structural changes.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is the difference between a latch and a lock in database systems?', 'Locks are logical constructs used for transaction isolation, protecting data from other transactions, and can be held for extended periods. Latches are physical, low-level synchronization primitives that protect in-memory data structures (like B-tree nodes) from concurrent access, held only for brief periods during operations. Locks are visible to the query processor; latches are internal to the storage engine.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'Explain the steal and force policies in buffer management.', 'Steal refers to whether dirty (modified) pages can be flushed to disk before a transaction commits. Force refers to whether all modified pages must be flushed when a transaction commits. Most modern systems use steal/no-force: pages can be flushed anytime (steal) but do not have to be flushed at commit (no-force). This provides flexibility but requires WAL for recovery.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What are the three phases of ARIES recovery?', '(1) Analysis phase: Scans the log from the last checkpoint to determine which transactions were active at crash time and which pages might be dirty. (2) Redo phase: Replays all logged operations from the oldest dirty page LSN to restore the database to its crash-time state. (3) Undo phase: Rolls back all transactions that were active but uncommitted at crash time, using CLRs to ensure idempotency.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What problem does the write skew anomaly represent?', 'Write skew occurs when two transactions read overlapping data sets, make decisions based on what they read, then write to disjoint data sets. Each transaction write is valid given what it read, but together they violate a constraint. Example: Two doctors both check that at least one doctor is on-call, then each removes themselves from on-call duty, leaving no coverage. Serializable isolation prevents this.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is the difference between read committed and repeatable read isolation levels?', 'Read committed prevents dirty reads but allows non-repeatable reads (a value can change if re-read within the same transaction). Repeatable read ensures that once a row is read, subsequent reads of that same row return the same value. However, repeatable read may still allow phantom reads (new rows appearing in range queries).', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'How does MVCC provide snapshot isolation?', 'MVCC maintains multiple versions of each data item, timestamped with transaction IDs. When a transaction starts, it receives a consistent snapshot based on its start timestamp. It sees only versions committed before its start time. Writers create new versions rather than overwriting, so readers never block writers and vice versa. Old versions are garbage collected when no longer needed by any active transaction.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is the purpose of checkpointing in database recovery?', 'Checkpointing creates a consistent recovery point by recording which transactions are active and which pages are dirty at a specific moment. This limits how far back recovery must scan the log. There are several types: (1) sync checkpoints halt all activity, (2) fuzzy checkpoints allow concurrent operations but track dirty page information, and (3) incremental checkpoints spread the work over time.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'How does copy-on-write (as in LMDB) differ from in-place updates?', 'In-place updates modify existing pages directly, requiring WAL for crash recovery. Copy-on-write never modifies existing pages; instead, it creates new versions of modified pages and their ancestors up to a new root. The old tree remains intact until the new root is atomically installed. This provides lock-free reads and instant recovery (just use the last valid root) but requires more storage and write amplification.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is the main advantage of lazy B-trees (like WiredTiger/LA-Trees)?', 'Lazy B-trees buffer updates in internal nodes rather than propagating them immediately to leaves. This converts random I/O into sequential I/O by batching updates and reduces write amplification. Updates percolate down lazily as nodes overflow. This is particularly beneficial for write-heavy workloads where immediate propagation would cause excessive disk I/O.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'How do Bw-Trees achieve lock-free operations?', 'Bw-Trees use delta records and compare-and-swap (CAS) operations instead of in-place modifications. Updates are appended as delta records to a chain, and pages are consolidated when the chain grows too long. An indirection table maps logical page IDs to physical locations, allowing atomic page swaps via CAS. This eliminates traditional lock contention but adds complexity for reads that must traverse delta chains.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is write amplification and why does it matter for B-trees?', 'Write amplification is the ratio of actual bytes written to disk versus the logical bytes of data being modified. For example, modifying a single key might require rewriting an entire page, giving high amplification. It matters because it affects SSD lifespan (limited write cycles), I/O bandwidth, and overall throughput. B-tree variants like FD-Trees and LA-Trees specifically optimize to reduce write amplification.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';

INSERT INTO faqs (module_id, question, answer, created_at, updated_at)
SELECT m.id, 'What is fractional cascading and how does FD-Tree use it?', 'Fractional cascading is a technique where each level of a multi-level index structure contains a fraction of pointers to the next level, creating shortcuts that reduce search time. FD-Trees use this to efficiently merge data between levels, allowing searches to skip directly to relevant portions of lower levels rather than searching each level independently.', 1764534396, 1764534396
FROM modules m JOIN projects p ON m.project_id = p.id WHERE p.name = 'Database Internals' AND m.name LIKE 'Chapters 4-6%';
