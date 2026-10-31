"""FileTree in-memory representation for package archives and PR trees."""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class FileEntry:
    """Single file representation in a FileTree."""

    path: str
    content: bytes
    size: int
    mode: int = 0o644


@dataclass
class FileTree:
    """In-memory tree structure of files extracted from an archive or commit."""

    files: dict[str, FileEntry] = field(default_factory=dict)

    def add_file(self, path: str, content: bytes, mode: int = 0o644) -> None:
        """Add a file entry to the tree."""
        self.files[path] = FileEntry(
            path=path,
            content=content,
            size=len(content),
            mode=mode,
        )

    def get_file(self, path: str) -> FileEntry | None:
        """Retrieve a file by relative path."""
        return self.files.get(path)
