#!/usr/bin/env python3
"""
Content indexing script for the Physical AI Textbook.
Parses markdown files, chunks content, generates embeddings, and stores in Qdrant.
"""

import asyncio
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

from app.services.embedding_service import get_embedding_service
from app.services.vector_service import get_vector_service


@dataclass
class ContentChunk:
    """A chunk of content to be indexed."""

    content: str
    chapter: str
    section: str
    locale: str
    url: str


class ContentIndexer:
    """Indexes textbook content into the vector database."""

    def __init__(self, docs_path: str, chunk_size: int = 800, chunk_overlap: int = 200):
        self.docs_path = Path(docs_path)
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.embedding_service = get_embedding_service()
        self.vector_service = get_vector_service()

    def parse_markdown(self, content: str) -> List[Dict[str, str]]:
        """Parse markdown content into sections by headings."""
        sections = []
        current_section = ""
        current_content = []

        lines = content.split("\n")

        for line in lines:
            # Check for heading
            heading_match = re.match(r"^(#{1,3})\s+(.+)$", line)

            if heading_match:
                # Save previous section
                if current_content:
                    sections.append(
                        {
                            "section": current_section or "Introduction",
                            "content": "\n".join(current_content).strip(),
                        }
                    )

                current_section = heading_match.group(2).strip()
                current_content = []
            else:
                # Skip import statements and empty lines at start
                if current_content or (line.strip() and not line.startswith("import ")):
                    current_content.append(line)

        # Add last section
        if current_content:
            sections.append(
                {
                    "section": current_section or "Content",
                    "content": "\n".join(current_content).strip(),
                }
            )

        return sections

    def chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks."""
        if len(text) <= self.chunk_size:
            return [text] if text.strip() else []

        chunks = []
        start = 0

        while start < len(text):
            end = start + self.chunk_size

            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence end near chunk boundary
                for sep in [". ", ".\n", "?\n", "!\n", "\n\n"]:
                    last_sep = text.rfind(sep, start + self.chunk_size // 2, end)
                    if last_sep != -1:
                        end = last_sep + len(sep)
                        break

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            # Move start with overlap
            start = end - self.chunk_overlap
            if start >= len(text):
                break

        return chunks

    def get_chapter_info(self, file_path: Path) -> Dict[str, str]:
        """Extract chapter info from file path."""
        relative = file_path.relative_to(self.docs_path)
        parts = list(relative.parts)

        # Determine locale
        locale = "en"
        if "i18n" in str(file_path) and "ur" in str(file_path):
            locale = "ur"

        # Extract chapter name from path
        chapter = "general"
        for part in parts:
            if part in [
                "intro",
                "ros2",
                "simulation",
                "isaac-sim",
                "vla-models",
                "humanoid",
                "resources",
            ]:
                chapter = part
                break
            elif part.startswith("lab"):
                chapter = part
                break

        # Build URL
        url_parts = [p for p in parts if p not in ["index.md", "index.mdx"]]
        url = "/" + "/".join(url_parts).replace(".md", "").replace(".mdx", "")
        if locale == "ur":
            url = "/ur" + url.replace(
                "/i18n/ur/docusaurus-plugin-content-docs/current", ""
            )

        return {"chapter": chapter, "locale": locale, "url": url}

    async def index_file(self, file_path: Path) -> int:
        """Index a single markdown file."""
        print(f"  Processing: {file_path.name}")

        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception as e:
            print(f"    Error reading file: {e}")
            return 0

        # Get chapter info
        info = self.get_chapter_info(file_path)

        # Parse into sections
        sections = self.parse_markdown(content)

        if not sections:
            print(f"    No sections found")
            return 0

        # Create chunks
        chunks: List[ContentChunk] = []
        for section in sections:
            text_chunks = self.chunk_text(section["content"])
            for text in text_chunks:
                chunks.append(
                    ContentChunk(
                        content=text,
                        chapter=info["chapter"],
                        section=section["section"],
                        locale=info["locale"],
                        url=info["url"],
                    )
                )

        if not chunks:
            print(f"    No chunks created")
            return 0

        print(f"    Created {len(chunks)} chunks")

        # Generate embeddings in batches
        batch_size = 20
        total_indexed = 0

        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            texts = [c.content for c in batch]

            try:
                embeddings = await self.embedding_service.get_embeddings(texts)

                payloads = [
                    {
                        "content": c.content,
                        "chapter": c.chapter,
                        "section": c.section,
                        "locale": c.locale,
                        "url": c.url,
                    }
                    for c in batch
                ]

                success = await self.vector_service.upsert_vectors(embeddings, payloads)
                if success:
                    total_indexed += len(batch)
            except Exception as e:
                print(f"    Error indexing batch: {e}")

        print(f"    Indexed {total_indexed} chunks")
        return total_indexed

    async def index_all(self, recreate_collection: bool = False) -> Dict[str, Any]:
        """Index all markdown files in the docs directory."""
        print(f"Starting indexing from: {self.docs_path}")

        # Ensure collection exists (recreate if needed for dimension changes)
        await self.vector_service.ensure_collection(recreate=recreate_collection)

        # Find all markdown files
        md_files = list(self.docs_path.glob("**/*.md")) + list(
            self.docs_path.glob("**/*.mdx")
        )

        # Filter to actual content files (skip sidebars, configs, etc.)
        content_files = [
            f
            for f in md_files
            if "node_modules" not in str(f)
            and "_category_" not in f.name
            and "sidebars" not in f.name
        ]

        print(f"Found {len(content_files)} content files")

        stats = {"files_processed": 0, "chunks_indexed": 0, "errors": []}

        for file_path in content_files:
            try:
                chunks = await self.index_file(file_path)
                stats["files_processed"] += 1
                stats["chunks_indexed"] += chunks
            except Exception as e:
                stats["errors"].append(f"{file_path.name}: {str(e)}")
                print(f"  Error: {e}")

        print(f"\nIndexing complete!")
        print(f"  Files processed: {stats['files_processed']}")
        print(f"  Chunks indexed: {stats['chunks_indexed']}")
        if stats["errors"]:
            print(f"  Errors: {len(stats['errors'])}")

        return stats


async def main():
    """Main entry point."""
    # Check for --recreate flag
    recreate = "--recreate" in sys.argv
    if recreate:
        print("Will recreate collection with new vector dimensions")

    # Get docs path from environment or use default
    project_root = Path(__file__).parent.parent.parent

    # Check both possible locations
    docs_path = project_root / "physical-ai-textbook" / "docs"
    if not docs_path.exists():
        docs_path = project_root / "docs"

    if not docs_path.exists():
        print(f"Error: Could not find docs directory at {docs_path}")
        print("Please set DOCS_PATH environment variable or run from project root")
        sys.exit(1)

    indexer = ContentIndexer(str(docs_path))
    stats = await indexer.index_all(recreate_collection=recreate)

    # Also index Urdu content if available
    urdu_docs = (
        project_root
        / "physical-ai-textbook"
        / "i18n"
        / "ur"
        / "docusaurus-plugin-content-docs"
        / "current"
    )
    if not urdu_docs.exists():
        urdu_docs = (
            project_root / "i18n" / "ur" / "docusaurus-plugin-content-docs" / "current"
        )
        urdu_docs = (
            project_root / "i18n" / "ur" / "docusaurus-plugin-content-docs" / "current"
        )

    if urdu_docs.exists():
        print(f"\nIndexing Urdu content from: {urdu_docs}")
        urdu_indexer = ContentIndexer(str(urdu_docs))
        urdu_stats = await urdu_indexer.index_all()
        stats["urdu_files"] = urdu_stats["files_processed"]
        stats["urdu_chunks"] = urdu_stats["chunks_indexed"]

    print("\nFinal Statistics:")
    print(f"  Total files: {stats['files_processed'] + stats.get('urdu_files', 0)}")
    print(f"  Total chunks: {stats['chunks_indexed'] + stats.get('urdu_chunks', 0)}")


if __name__ == "__main__":
    asyncio.run(main())
