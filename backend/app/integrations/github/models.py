"""Typed GitHub response models.

Implemented in Phase 4.
"""

from pydantic import BaseModel, ConfigDict


class GitHubUserModel(BaseModel):
    """GitHub user profile payload."""

    model_config = ConfigDict(extra="ignore")

    id: int
    login: str
    avatar_url: str | None = None


class GitHubPullRequestModel(BaseModel):
    """GitHub Pull Request response."""

    model_config = ConfigDict(extra="ignore")

    number: int
    title: str
    head_sha: str
    base_sha: str
