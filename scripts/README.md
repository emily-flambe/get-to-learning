# Developer Scripts

Utility scripts for content preparation and maintenance. Not part of the web application.

## split_pdf_chapters.py

Splits a multi-chapter PDF into separate PDF files by detecting chapter boundaries.

### Requirements

```bash
pip install pypdf
```

### Usage

```bash
# Basic usage - auto-detects "CHAPTER X" headings at start of pages
python split_pdf_chapters.py book.pdf

# Specify output directory
python split_pdf_chapters.py book.pdf ./output_folder

# Custom pattern (e.g., for "Part 1", "Part 2" style books)
python split_pdf_chapters.py book.pdf ./output 'Part\s+\d+'
```

### Features

- Detects chapter boundaries by scanning for `CHAPTER X` at the start of pages
- Handles numbered chapters (1, 2, 3), Roman numerals (I, II, III), and word numbers (One, Two)
- Outputs files named `ch_1.pdf`, `ch_2.pdf`, etc.
- Strict matching avoids false positives from chapter references in body text

### Limitations

- Requires PDFs with extractable text for chapter detection
- Chapter headings must appear at the beginning of a page
- Image-based chapter title pages will be missed (extract manually if needed)

### Example: Database Internals

```bash
python split_pdf_chapters.py "Database Internals.pdf" ../.content/FishBook/pdf/
```

Note: Chapter 8 in Database Internals has an image-based title page. It was extracted manually covering PDF pages 190-214.
