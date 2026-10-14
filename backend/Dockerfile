# ==============================================================================
# NAVIFY Ecosystem - Security-Hardened Production Dockerfile
# ==============================================================================
# Multi-stage build with non-root user execution and minimal attack surface

FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final Production Stage
FROM python:3.11-slim AS runner

WORKDIR /app

# Create unprivileged system user for security (no root execution)
RUN groupadd -g 10001 navify && \
    useradd -u 10001 -g navify -s /bin/bash -m navify

# Copy installed packages from builder
COPY --from=builder /root/.local /home/navify/.local

# Copy application source code
COPY --chown=navify:navify . .

# Set secure environment variables
ENV PATH=/home/navify/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Switch to non-root user
USER navify

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/status || exit 1

EXPOSE 8000

# Run with production Uvicorn settings
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT} --workers 2 --proxy-headers --forwarded-allow-ips='*'"]

