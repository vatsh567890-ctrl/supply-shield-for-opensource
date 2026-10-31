"""Job names and ID-only payload models."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict

JOB_RUN_ANALYSIS = "run_analysis"


class AnalysisJobPayload(BaseModel):
    """Job queue payload containing strictly the analysis ID."""

    model_config = ConfigDict(extra="forbid")

    analysis_id: UUID
