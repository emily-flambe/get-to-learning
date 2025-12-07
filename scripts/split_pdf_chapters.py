#!/usr/bin/env python3
"""
PDF Chapter Splitter
Splits a multi-chapter PDF into separate PDF files by detecting chapter boundaries.
"""

import re
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter


def find_chapter_pages(reader: PdfReader, pattern: str = None, strict: bool = True) -> list[tuple[int, str]]:
    """
    Find pages where chapters begin by scanning for chapter headings.

    Args:
        reader: PdfReader instance
        pattern: Optional regex pattern to match chapter headings
        strict: If True, only match chapters at the very start of the page (default)

    Returns:
        List of (page_index, chapter_title) tuples, sorted by page index
    """
    if pattern is None:
        # Default pattern matches: CHAPTER 1, Chapter One, CHAPTER IV, etc.
        # Using ^ anchor with MULTILINE to match at start of a line
        pattern = r'^CHAPTER\s+(\d+|[IVX]+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN)'

    chapter_regex = re.compile(pattern, re.IGNORECASE | re.MULTILINE)
    chapters = []

    for page_idx, page in enumerate(reader.pages):
        text = page.extract_text()
        if not text:
            continue

        # Check the beginning of the page for chapter heading
        # Use first 200 chars for strict mode (heading should be at very top)
        preview = text[:200] if strict else text[:500]
        match = chapter_regex.search(preview)

        if match:
            # Additional check: heading should be near the start (within first 50 chars)
            if strict and match.start() > 50:
                continue
            chapter_title = match.group(0).strip()
            chapters.append((page_idx, chapter_title))

    return sorted(chapters, key=lambda x: x[0])


def normalize_chapter_number(chapter_title: str) -> str:
    """Convert chapter title to a normalized filename-safe format."""
    # Extract chapter number/identifier
    match = re.search(r'CHAPTER\s+(\d+|[IVX]+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN)',
                      chapter_title, re.IGNORECASE)
    if not match:
        return chapter_title.lower().replace(' ', '_')

    identifier = match.group(1).upper()

    # Convert word numbers to digits
    word_to_num = {
        'ONE': '1', 'TWO': '2', 'THREE': '3', 'FOUR': '4', 'FIVE': '5',
        'SIX': '6', 'SEVEN': '7', 'EIGHT': '8', 'NINE': '9', 'TEN': '10'
    }

    if identifier in word_to_num:
        return word_to_num[identifier]

    # Convert Roman numerals to digits
    roman_to_num = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
                    'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10}
    if identifier in roman_to_num:
        return str(roman_to_num[identifier])

    return identifier


def split_pdf_by_chapters(
    input_path: str,
    output_dir: str = None,
    chapter_pattern: str = None
) -> list[str]:
    """
    Split a PDF file into separate PDFs, one per chapter.

    Args:
        input_path: Path to the input PDF file
        output_dir: Directory for output files (defaults to same as input)
        chapter_pattern: Optional regex pattern for chapter detection

    Returns:
        List of paths to created output files
    """
    input_path = Path(input_path)
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if output_dir is None:
        output_dir = input_path.parent
    else:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Reading: {input_path}")
    reader = PdfReader(str(input_path))
    total_pages = len(reader.pages)
    print(f"Total pages: {total_pages}")

    # Find chapter boundaries
    chapters = find_chapter_pages(reader, chapter_pattern)

    if not chapters:
        print("No chapters detected. Check if PDF has extractable text or adjust pattern.")
        return []

    print(f"\nDetected {len(chapters)} chapter(s):")
    for page_idx, title in chapters:
        print(f"  Page {page_idx + 1}: {title}")

    # Calculate page ranges for each chapter
    chapter_ranges = []
    for i, (start_page, title) in enumerate(chapters):
        if i + 1 < len(chapters):
            end_page = chapters[i + 1][0] - 1
        else:
            end_page = total_pages - 1
        chapter_ranges.append((start_page, end_page, title))

    # Create output PDFs
    output_files = []
    base_name = input_path.stem

    print(f"\nSplitting into separate files...")
    for start_page, end_page, title in chapter_ranges:
        chapter_num = normalize_chapter_number(title)
        output_name = f"ch_{chapter_num}.pdf"
        output_path = output_dir / output_name

        writer = PdfWriter()
        for page_idx in range(start_page, end_page + 1):
            writer.add_page(reader.pages[page_idx])

        with open(output_path, 'wb') as f:
            writer.write(f)

        page_count = end_page - start_page + 1
        print(f"  Created: {output_name} (pages {start_page + 1}-{end_page + 1}, {page_count} pages)")
        output_files.append(str(output_path))

    return output_files


def main():
    """Command-line interface for PDF chapter splitter."""
    if len(sys.argv) < 2:
        print("Usage: python split_pdf_chapters.py <input.pdf> [output_dir] [chapter_pattern]")
        print("\nExample:")
        print("  python split_pdf_chapters.py book.pdf")
        print("  python split_pdf_chapters.py book.pdf ./output")
        print("  python split_pdf_chapters.py book.pdf ./output 'Part\\s+\\d+'")
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    pattern = sys.argv[3] if len(sys.argv) > 3 else None

    try:
        output_files = split_pdf_by_chapters(input_path, output_dir, pattern)
        if output_files:
            print(f"\nSuccessfully created {len(output_files)} chapter file(s)")
        else:
            print("\nNo output files created")
            sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
