-- Migration: Improve FAQ answers with better explanatory context and complete sentences
-- Target: Remote module_id = 2 (Database Internals)

-- ID 2: Page headers
UPDATE faqs SET answer = 'Every B-tree page begins with a fixed-size header that contains essential metadata about that page. This header typically includes information like the page type (whether it is a leaf or internal node), how many cells the page contains, where free space begins, pointers to related pages, and often a magic number to verify page integrity.

**Why this matters:** Without this header, the database would need to scan the entire page contents just to understand basic facts about the page. The header allows the storage engine to quickly navigate and interpret pages during tree traversal.

**Real-world implementations:** PostgreSQL, MySQL InnoDB, and SQLite all use page headers, though each stores slightly different fields based on their specific needs.

**The tradeoff:** Header space takes away from room available for actual data. A larger header means fewer keys can fit per page, which can increase tree height.

See: Chapter 5, "Page Header" section' WHERE id = 2;

-- ID 3: Sibling links
UPDATE faqs SET answer = 'Sibling links are forward (and sometimes backward) pointers that connect nodes at the same level of the B-tree. For example, all leaf nodes might be linked together in a chain from left to right.

**Why this matters:** When you need to scan a range of keys (like "find all orders from January"), sibling links let you traverse horizontally across leaf nodes without repeatedly climbing back up to parent nodes and descending again. This makes range queries dramatically more efficient.

**Real-world implementations:** Most B-tree implementations include sibling links. They are notably central to Blink-trees, which PostgreSQL uses. The linked structure enables efficient sequential scans.

**The tradeoff:** Every time a node splits or two nodes merge, you must update the sibling links of neighboring nodes. This adds coordination complexity, especially in concurrent environments.

See: Chapter 5, "Sibling Links" section' WHERE id = 3;

-- ID 4: High keys
UPDATE faqs SET answer = 'A high key is an extra key stored in each B-tree node that represents the highest possible key value that could exist anywhere in that node''s subtree. Think of it as a "ceiling" marker for the subtree.

**Why this matters:** During concurrent operations, another thread might split a node while you are traversing the tree. If your search key is higher than a node''s high key, you know the key you are looking for must have moved to a sibling node (due to a split), so you follow the sibling link to catch up. This allows safe concurrent navigation without holding locks on parent nodes.

**Real-world implementations:** PostgreSQL uses high keys as part of its Blink-tree implementation, which enables highly concurrent B-tree operations.

**The tradeoff:** Each node requires extra storage space for the high key, and the search logic becomes slightly more complex since you must check the high key and potentially follow sibling links.

See: Chapter 5, "Node High Keys" and Chapter 6, "Blink-Trees" sections' WHERE id = 4;

-- ID 5: Overflow pages
UPDATE faqs SET answer = 'When a value is too large to fit in a normal B-tree cell, databases have two main strategies. Overflow pages are additional pages linked from the primary page that store the excess data. Alternatively, separate pointer pages store only key-pointer pairs in the B-tree itself, with all values stored elsewhere entirely.

**Why this matters:** Real-world data often includes variable-length fields like text or blobs that can vary from a few bytes to megabytes. Without overflow handling, you would need enormous page sizes (wasteful for small values) or strict size limits (limiting what data you can store).

**Real-world implementations:** SQLite uses overflow pages when a value exceeds about 25% of the page size. MySQL InnoDB similarly uses overflow pages for large BLOBs and TEXT fields.

**The tradeoff:** Fetching overflow data requires additional I/O operations beyond reading the primary page. This also creates fragmentation challenges and bookkeeping complexity for tracking which overflow pages belong to which records.

See: Chapter 5, "Overflow Pages" section' WHERE id = 5;

-- ID 6: Breadcrumbs
UPDATE faqs SET answer = 'Breadcrumbs are a stack data structure that records your traversal path from the root down to your current position in the B-tree. Each entry in the stack contains a reference to a node you visited and which child pointer you followed.

**Why this matters:** When you insert a key and the leaf node splits, the split must propagate upward - the parent needs a new separator key, and it might split too. Without breadcrumbs, you would need permanent parent pointers in every node. Instead, breadcrumbs let you walk back up the path you came down, propagating splits or merges as needed.

**Real-world implementations:** PostgreSQL maintains a BTStack structure during B-tree operations that serves exactly this purpose.

**The tradeoff:** Breadcrumbs consume memory proportional to tree height during operations. They must also be maintained correctly through complex operations like splits that might restructure multiple levels of the tree.

See: Chapter 5, "Breadcrumbs" section' WHERE id = 6;

-- ID 7: Latches vs locks
UPDATE faqs SET answer = 'Database systems distinguish between two types of concurrency control mechanisms that serve different purposes.

**Locks** protect logical data from conflicting transactions. They operate at a high level (rows, tables, or predicates), can be held for extended periods while a transaction runs, and are visible to the query processor for deadlock detection and wait management.

**Latches** protect physical in-memory data structures like B-tree nodes from concurrent access by multiple threads. They are low-level mutex-like primitives, held only briefly (microseconds), and are internal to the storage engine.

**Why this matters:** A single transaction might acquire thousands of latches as it traverses B-tree nodes, but only a few locks on the actual data it reads or writes. These different granularities require different mechanisms - you would not want the overhead of full lock management for every B-tree node access.

**The tradeoff:** Latches add overhead to every B-tree operation since nodes must be protected during access. Locks add overhead to transactions but enable long-term data protection and deadlock handling.

See: Chapter 6, "Locks" and "Latches" sections' WHERE id = 7;

-- ID 8: Steal and force policies
UPDATE faqs SET answer = 'Buffer management policies determine when modified (dirty) pages can or must be written to disk. These policies are usually described with two questions:

**Steal policy:** Can the buffer manager flush a dirty page to disk before the transaction that modified it has committed? If yes, uncommitted changes might reach disk.

**Force policy:** Must all pages modified by a transaction be flushed to disk when that transaction commits? If yes, commits require synchronous I/O.

Most modern databases use a **steal/no-force** policy. Pages can be flushed anytime (steal), but they do not have to be flushed at commit time (no-force). This gives the buffer manager maximum flexibility.

**Why this matters:** No-force means commits can be fast - just write the log record, not all the data pages. Steal means the buffer manager can evict any page when it needs memory.

**The tradeoff:** Steal/no-force is flexible but requires write-ahead logging (WAL) for crash recovery. If uncommitted changes reach disk (steal) or committed changes have not (no-force), the recovery system must be able to undo or redo them.

See: Chapter 6, "Steal and Force Policies" section' WHERE id = 8;

-- ID 9: ARIES recovery
UPDATE faqs SET answer = 'ARIES (Algorithms for Recovery and Isolation Exploiting Semantics) is a crash recovery algorithm that uses three phases to restore a database to a consistent state after a failure.

**Phase 1 - Analysis:** Starting from the last checkpoint, scan the log forward to determine which transactions were active at crash time and which pages might have uncommitted modifications (the dirty page table).

**Phase 2 - Redo:** Replay all logged operations from the checkpoint forward to reconstruct exactly the state the database was in at crash time. This includes changes from both committed and uncommitted transactions.

**Phase 3 - Undo:** Roll back all transactions that were active at crash time but never committed. This uses Compensation Log Records (CLRs) to ensure idempotency - if we crash during recovery, re-running undo will not cause problems.

**Why this matters:** ARIES enables the steal/no-force buffer policy, which gives excellent runtime performance. Checkpoints limit how much log must be processed during recovery.

**Real-world implementations:** ARIES forms the basis for recovery in most modern relational databases, including IBM DB2, Microsoft SQL Server, and others.

**The tradeoff:** The system must maintain the write-ahead log and periodic checkpoints. The algorithm itself is complex to implement correctly.

See: Chapter 6, "ARIES" section' WHERE id = 9;

-- ID 10: Write skew anomaly
UPDATE faqs SET answer = 'Write skew is a concurrency anomaly that can occur even under snapshot isolation. It happens when two transactions read overlapping data, make independent decisions based on what they read, and then write to different (non-overlapping) rows - together violating a constraint that neither transaction would violate alone.

**Classic example:** A hospital requires at least one doctor on call at all times. Doctors Alice and Bob are both on call. Each one, in a separate transaction, checks "is there another doctor on call?" Both see yes (the other doctor). Each then removes themselves from on-call duty. Result: zero doctors on call, violating the constraint.

**Why this matters:** Write skew demonstrates that checking each row independently is not enough when constraints span multiple rows. Neither transaction wrote to a row the other wrote to, so there was no write-write conflict to detect.

**How to prevent it:** True serializable isolation prevents write skew, but with higher overhead than snapshot isolation. Some systems offer explicit locking or constraint mechanisms for specific cases.

See: Chapter 6, "Read and Write Anomalies" section' WHERE id = 10;

-- ID 11: Isolation levels
UPDATE faqs SET answer = 'Database isolation levels define what changes from other concurrent transactions are visible to your transaction. Two commonly confused levels are read committed and repeatable read.

**Read committed:** Each time you read a row, you see the most recently committed version of that row. If another transaction commits a change between your two reads of the same row, you will see different values. This prevents dirty reads (seeing uncommitted data) but allows non-repeatable reads.

**Repeatable read:** When your transaction starts, it gets a consistent snapshot. Every time you read a row, you see the version that was committed at your snapshot time. Re-reading the same row always returns the same value. However, new rows inserted by other transactions can still appear (phantom reads).

**Why this matters:** Different applications have different needs. A financial report might need repeatable read to ensure consistent totals. A real-time dashboard might prefer read committed to see the latest data even at the cost of some inconsistency.

**The tradeoff:** Higher isolation levels require more locking or more version storage, reducing concurrency or increasing overhead.

See: Chapter 6, "Isolation Levels" section' WHERE id = 11;

-- ID 12: MVCC
UPDATE faqs SET answer = 'Multi-Version Concurrency Control (MVCC) is a technique where the database maintains multiple timestamped versions of each row rather than overwriting data in place. When a transaction starts, it receives a timestamp, and throughout its execution, it sees only row versions that were committed before that timestamp.

**How it works:** When you update a row under MVCC, the database does not overwrite the existing version. Instead, it creates a new version with a newer timestamp. Older transactions continue to see the old version; newer transactions see the new version. This means readers never block writers and writers never block readers - they simply see different versions.

**Why this matters:** Traditional locking would make readers wait for writers (and vice versa). MVCC allows much higher concurrency for read-heavy workloads, which describes most applications.

**Real-world implementations:** PostgreSQL, MySQL InnoDB, and Oracle all use MVCC as a fundamental part of their concurrency control.

**The tradeoff:** The database must store multiple versions of rows, consuming extra storage. Old versions eventually need garbage collection (vacuuming), which adds background work. Write skew anomalies can still occur under snapshot isolation.

See: Chapter 6, "Multiversion Concurrency Control" section' WHERE id = 12;

-- ID 13: Checkpointing
UPDATE faqs SET answer = 'A checkpoint is a point in time where the database records which transactions are active and which pages have been modified but not yet written to disk. This creates a recovery boundary - during crash recovery, you only need to process the log from the most recent checkpoint forward, not from the beginning of time.

**Two main approaches exist:**

**Sync checkpoints:** Halt all database activity, flush all dirty pages to disk, and record the checkpoint. Simple to implement, but the pause can be significant for large databases.

**Fuzzy checkpoints:** Record checkpoint information while the database continues operating normally. Dirty pages are flushed gradually in the background. More complex to implement, but avoids blocking normal operations.

**Why this matters:** Without checkpoints, crash recovery would need to replay the entire transaction log from when the database was first created. For a database that has been running for years, this could take an impossibly long time. Checkpoints bound recovery time to a manageable window.

**The tradeoff:** Taking checkpoints consumes I/O bandwidth that competes with normal operations. More frequent checkpoints mean faster recovery but more runtime overhead.

See: Chapter 6, "Recovery" section' WHERE id = 13;

-- ID 14: Copy-on-write
UPDATE faqs SET answer = 'Copy-on-write is an alternative to the traditional approach of modifying B-tree pages in place. Instead of overwriting an existing page, you create a new copy with your changes, then atomically update the parent pointer to reference the new page. The old page remains untouched until the new structure is fully installed.

**How it differs from in-place updates:** Traditional B-trees modify pages directly and rely on write-ahead logging (WAL) for crash recovery. Copy-on-write never modifies existing pages, so the old tree remains valid until you atomically swap in a new root. If you crash mid-operation, the old tree is still intact.

**Why this matters:** Recovery becomes trivial - just use the last valid root pointer. Readers can traverse the old tree without any locks while writers build the new structure. This provides natural snapshot isolation.

**Real-world implementations:** LMDB (Lightning Memory-mapped Database) uses copy-on-write. Several filesystems like ZFS and Btrfs also use this technique.

**The tradeoff:** Every write must copy and rewrite the entire path from the modified leaf up to the root, causing write amplification. The database needs more storage to hold both old and new versions during updates.

See: Chapter 7, "Copy-on-Write" section' WHERE id = 14;

-- ID 15: Lazy B-trees
UPDATE faqs SET answer = 'Lazy B-trees (also called write-optimized B-trees) buffer updates in internal nodes rather than immediately propagating changes down to leaf nodes. When you insert or update a key, the change is added to a buffer in an upper-level node. Only when that buffer fills up do the changes percolate down to the next level.

**How this helps:** Consider inserting 1000 random keys. In a traditional B-tree, each insert might touch different leaf pages, causing random I/O. In a lazy B-tree, all 1000 inserts go into an upper buffer. When that buffer flushes, the updates are sorted and applied to lower levels in batch, converting random writes into sequential writes.

**Why this matters:** Random I/O is dramatically slower than sequential I/O, especially on spinning disks but even on SSDs. Batching updates can improve write throughput by 10-100x in some workloads.

**Real-world implementations:** WiredTiger (the default storage engine for MongoDB) uses this technique. LA-Trees (Log-structured Access Method Trees) are another example.

**The tradeoff:** Reads become more complex because you must check buffers at each level and merge any pending updates with the base data. Buffer management adds complexity, and there is memory overhead for the buffers themselves.

See: Chapter 7, "Lazy B-Trees" section' WHERE id = 15;

-- ID 16: Bw-Trees
UPDATE faqs SET answer = 'Bw-Trees achieve lock-free concurrent operations through two key innovations: delta records and an indirection table.

**Delta records:** Instead of modifying a page in place (which would require locks), updates append small delta records to a chain attached to the logical page. A page might have a base state plus a chain of deltas representing recent inserts, updates, or deletes.

**Indirection table:** A mapping table translates logical page IDs to physical memory locations. When you want to atomically update a page (such as consolidating a delta chain), you use a compare-and-swap (CAS) operation on the indirection table entry. This single atomic operation swaps in the new page state.

**Why this matters:** Lock-free data structures can provide better scalability on many-core systems by eliminating lock contention. No thread ever waits for another thread to release a lock.

**Real-world implementations:** Microsoft SQL Server Hekaton (the in-memory OLTP engine) uses Bw-Trees for its indexes.

**The tradeoff:** Reads must traverse the delta chain and merge all deltas to reconstruct the current state. When chains grow too long, periodic consolidation is needed. The indirection table itself adds memory overhead and an extra lookup.

See: Chapter 7, "Bw-Trees" section' WHERE id = 16;

-- ID 17: Write amplification
UPDATE faqs SET answer = 'Write amplification is the ratio of bytes physically written to storage versus the logical bytes your application wanted to write. For example, if you update a single 100-byte record but the database must rewrite a 4KB page to do so, your write amplification is 40x.

**Why this matters for several reasons:**

**SSD lifespan:** Flash memory cells can only be written a limited number of times before wearing out. High write amplification accelerates SSD wear.

**I/O bandwidth:** Your storage has finite write throughput. If write amplification is 40x, your effective application write throughput is 40x lower than the raw storage speed.

**Overall performance:** Write-heavy workloads can become bottlenecked by write amplification even when the logical write volume seems modest.

**Why B-trees specifically have this problem:** A random insert might only add a few bytes of actual data, but it requires reading a page, modifying it, and writing the whole page back. Tree restructuring (splits, merges) makes this worse.

**Real-world optimizations:** B-tree variants like Lazy B-Trees, FD-Trees, and Bw-Trees are specifically designed to reduce write amplification through batching, log-structuring, and other techniques.

**The tradeoff:** Techniques that reduce write amplification often add complexity and can slow down reads or require more memory.

See: Chapter 7, "Bw-Trees" section' WHERE id = 17;

-- ID 18: Fractional cascading
UPDATE faqs SET answer = 'Fractional cascading is a technique for speeding up searches across multiple sorted levels of a data structure. The core idea is to include "shortcut" pointers between adjacent levels, so that after finding your position in one level, you can jump directly to approximately the right position in the next level.

**How it works:** When building the index, each level stores not just its own elements but also fractional pointers (sampled elements) from the next level down. When searching, you binary search the top level once, then use the fractional pointers to narrow your search range at each subsequent level.

**Why this matters:** Consider a structure with L levels, each containing N elements. Without fractional cascading, you would do a binary search at each level: O(L * log N). With fractional cascading, you do one binary search plus a constant-time hop at each level: O(log N + L). For structures with many levels, this is a significant improvement.

**Real-world implementations:** FD-Trees use fractional cascading to create SSD-optimized indexes. The technique appears in computational geometry algorithms and some database index structures.

**The tradeoff:** The fractional pointers consume extra storage space. Merge operations between levels become more complex because the pointers must be maintained. The benefit is mainly for read-heavy workloads with many levels.

See: Chapter 7, "FD-Trees" and "Fractional Cascading" sections' WHERE id = 18;
