"""Repository for saving and querying ML shadow model results."""

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.ml_shadow_result import MLShadowResult


class MLShadowRepository:
    """Handles persistence and retrieval of MLShadowResult records."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        analysis_id: uuid.UUID,
        model_version: str,
        probability: float,
        predicted_label: int,
        top_features: dict[str, Any] | list[Any],
        execution_time_ms: float,
    ) -> MLShadowResult:
        """Create and persist a new MLShadowResult record."""
        result = MLShadowResult(
            analysis_id=analysis_id,
            model_version=model_version,
            probability=probability,
            predicted_label=predicted_label,
            top_features=top_features,
            execution_time_ms=execution_time_ms,
        )
        self.session.add(result)
        await self.session.commit()
        await self.session.refresh(result)
        return result

    async def get_by_analysis_id(
        self,
        analysis_id: uuid.UUID,
    ) -> list[MLShadowResult]:
        """Retrieve all shadow results associated with an analysis ID."""
        stmt = (
            select(MLShadowResult)
            .where(MLShadowResult.analysis_id == analysis_id)
            .order_by(MLShadowResult.created_at.asc())
        )
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

