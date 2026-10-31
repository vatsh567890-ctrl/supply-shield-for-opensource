FROM python:3.12-slim

# Install system dependencies and security updates
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.5.0 /uv /bin/uv

# Set working directory
WORKDIR /app

# Create a non-root user
RUN groupadd -g 10001 appuser && \
    useradd -u 10000 -g appuser -s /bin/false appuser && \
    mkdir -p /tmp /app && \
    chown -R appuser:appuser /app /tmp

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install Python dependencies using uv
RUN uv sync --frozen --no-dev --no-install-project

# Copy application source
COPY . .

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
