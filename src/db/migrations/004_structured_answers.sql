-- Restructure answers with: What, Problem Solved, Implementations, Tradeoff

UPDATE faqs SET answer = 'A fixed-size area at the beginning of each B-tree page storing metadata (page type, cell count, free space, pointers, magic number).

**Problem solved:** Navigate and interpret pages without scanning all content.

**Implementations:** PostgreSQL, MySQL InnoDB, SQLite (each stores different fields).

**Tradeoff:** Header space reduces room for actual data.

See: Chapter 4, "Page Header" section' WHERE id = 2;

UPDATE faqs SET answer = 'Forward (and sometimes backward) pointers connecting nodes at the same tree level.

**Problem solved:** Efficient range scans without ascending to parent nodes—critical for iterating over key ranges.

**Implementations:** Most B-tree implementations; notably used in Blink-trees (PostgreSQL).

**Tradeoff:** Must update sibling links during every split/merge, adding coordination complexity.

See: Chapter 4, "Sibling Links" section' WHERE id = 3;

UPDATE faqs SET answer = 'An extra key in each node representing the highest possible key in that subtree. During concurrent access, if your search key exceeds the high key, follow the sibling link to catch up.

**Problem solved:** Safe concurrent navigation during splits—no need to hold locks on parent nodes.

**Implementations:** PostgreSQL (Blink-trees).

**Tradeoff:** Extra storage per node; slightly more complex search logic.

See: Chapter 4, "Node High Keys" and Chapter 5, "Blink-Trees" sections' WHERE id = 4;

UPDATE faqs SET answer = 'Overflow pages: additional pages linked from a primary page to store values exceeding the cell space limit. Separate pointer pages: store only pointers in the B-tree, putting values elsewhere entirely.

**Problem solved:** Handle variable-length and large values without huge page sizes.

**Implementations:** SQLite and MySQL InnoDB use overflow pages.

**Tradeoff:** Extra I/O to fetch overflow data; fragmentation and bookkeeping complexity.

See: Chapter 4, "Overflow Pages" section' WHERE id = 5;

UPDATE faqs SET answer = 'A stack recording the traversal path from root to leaf, storing node references and child pointer indices.

**Problem solved:** Walk back up the tree to propagate splits/merges without storing permanent parent pointers.

**Implementations:** PostgreSQL (BTStack).

**Tradeoff:** Memory overhead during operations; must be maintained correctly through complex operations.

See: Chapter 4, "Breadcrumbs" section' WHERE id = 6;

UPDATE faqs SET answer = '**Locks:** Protect data from other transactions. Logical, can be held for extended periods, visible to query processor.

**Latches:** Protect in-memory structures (like B-tree nodes) from concurrent access. Physical, held briefly, internal to storage engine.

**Problem solved:** Different granularity needs—transactions need long-term data protection; internal structures need quick mutex-style protection.

**Tradeoff:** Latches add overhead to every B-tree operation; locks add overhead to transactions.

See: Chapter 5, "Locks" and "Latches" sections' WHERE id = 7;

UPDATE faqs SET answer = '**Steal:** Can dirty pages be flushed before transaction commits?
**Force:** Must all modified pages be flushed when transaction commits?

Most modern systems use **steal/no-force**: pages can be flushed anytime, but don''t have to be flushed at commit.

**Problem solved:** Balance between commit latency, recovery complexity, and buffer flexibility.

**Tradeoff:** Steal/no-force is flexible but requires WAL for recovery. No-steal simplifies recovery but limits buffer management.

See: Chapter 5, "Steal and Force Policies" section' WHERE id = 8;

UPDATE faqs SET answer = 'Three-phase crash recovery algorithm:

1. **Analysis:** Scan log from last checkpoint to find active transactions and dirty pages
2. **Redo:** Replay all logged operations to restore crash-time state
3. **Undo:** Roll back uncommitted transactions using CLRs for idempotency

**Problem solved:** Correct recovery with steal/no-force policy while minimizing recovery time via checkpoints.

**Implementations:** Widely used; basis for most modern recovery systems.

**Tradeoff:** Requires maintaining WAL and checkpoint metadata; implementation complexity.

See: Chapter 5, "ARIES" section' WHERE id = 9;

UPDATE faqs SET answer = 'Two transactions read overlapping data, make independent decisions, then write to disjoint data—together violating a constraint neither would violate alone.

**Example:** Two doctors both check "at least one doctor on-call," then each removes themselves, leaving zero coverage.

**Problem solved:** Demonstrates that per-row isolation isn''t enough when constraints span multiple rows.

**Prevention:** Serializable isolation (but with higher overhead than snapshot isolation).

See: Chapter 5, "Read and Write Anomalies" section' WHERE id = 10;

UPDATE faqs SET answer = '**Read committed:** See each row as of its latest commit. Prevents dirty reads, but values can change between reads in the same transaction.

**Repeatable read:** See rows as of transaction start. Re-reading the same row returns the same value. But new rows can still appear (phantom reads).

**Problem solved:** Different applications need different consistency vs. performance trade-offs.

**Tradeoff:** Higher isolation = more locking or versioning overhead.

See: Chapter 5, "Isolation Levels" section' WHERE id = 11;

UPDATE faqs SET answer = 'Maintain multiple timestamped versions of each row. Transactions see a consistent snapshot from their start time—only versions committed before then are visible.

Writers create new versions rather than overwriting, so **readers never block writers and vice versa**.

**Problem solved:** Concurrent read/write access without blocking.

**Implementations:** PostgreSQL, MySQL InnoDB, Oracle.

**Tradeoff:** Storage overhead for old versions; garbage collection complexity; write skew still possible.

See: Chapter 5, "Multiversion Concurrency Control" section' WHERE id = 12;

UPDATE faqs SET answer = 'Recording which transactions are active and which pages are dirty at a specific point, creating a recovery boundary.

**Types:**
- Sync checkpoint: halt all activity (simple but blocks operations)
- Fuzzy checkpoint: allow concurrent operations (complex but non-blocking)

**Problem solved:** Without checkpoints, recovery must replay the entire log from the beginning.

**Tradeoff:** Checkpoint I/O competes with normal operations.

See: Chapter 5, "Recovery" section' WHERE id = 13;

UPDATE faqs SET answer = '**In-place updates:** Modify existing pages directly. Requires WAL for crash recovery.

**Copy-on-write:** Never modify existing pages. Create new copies and atomically swap in a new root. Old tree remains intact until new root is installed.

**Problem solved:** Instant recovery (just use last valid root) and lock-free reads.

**Implementations:** LMDB, some filesystems (ZFS, Btrfs).

**Tradeoff:** Higher write amplification; more storage needed; every write rewrites the full path to root.

See: Chapter 6, "Copy-on-Write" section' WHERE id = 14;

UPDATE faqs SET answer = 'Buffer updates in internal nodes rather than immediately propagating to leaves. Updates percolate down lazily as nodes overflow.

**Problem solved:** Converts random I/O to sequential I/O; batches updates to reduce write amplification.

**Implementations:** WiredTiger (MongoDB default), LA-Trees.

**Tradeoff:** Reads must merge buffered updates with base data; buffer management complexity.

See: Chapter 6, "Lazy B-Trees" section' WHERE id = 15;

UPDATE faqs SET answer = 'Use delta records and compare-and-swap (CAS) operations instead of in-place modifications. An indirection table maps logical page IDs to physical locations, allowing atomic page swaps.

Updates append delta records to a chain; pages are consolidated when chains grow too long.

**Problem solved:** Lock-free operations—eliminates traditional lock contention.

**Implementations:** Microsoft SQL Server Hekaton.

**Tradeoff:** Reads must traverse delta chains; periodic consolidation required; indirection table overhead.

See: Chapter 6, "Bw-Trees" section' WHERE id = 16;

UPDATE faqs SET answer = 'The ratio of bytes actually written to disk vs. logical bytes modified. Example: changing 1 byte may require rewriting a 4KB page (4000x amplification).

**Why it matters:**
- SSD lifespan (limited write cycles)
- I/O bandwidth consumption
- Overall throughput

**Problem solved:** B-tree variants like Lazy B-Trees and FD-Trees specifically optimize to reduce this.

**Tradeoff:** Reducing write amplification often means more complex data structures or slower reads.

See: Chapter 6, "Bw-Trees" section' WHERE id = 17;

UPDATE faqs SET answer = 'Include shortcuts (fractional pointers) between levels of a multi-level structure. Each level contains pointers to the next level, reducing search time.

**Problem solved:** Reduces search time in multi-level indexes from O(L × log N) toward O(log N + L).

**Implementations:** FD-Trees use this for SSD-optimized indexing with logarithmic sorted runs.

**Tradeoff:** Extra pointers add storage overhead; more complex merge operations between levels.

See: Chapter 6, "FD-Trees" and "Fractional Cascading" sections' WHERE id = 18;
