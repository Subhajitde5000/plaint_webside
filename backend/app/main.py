from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
import sys
import structlog

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.config import settings
# from app.database import engine
from app.api.router import api_router

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Hero Plant Store API", env=settings.ENVIRONMENT)
    yield
    logger.info("Shutting down Hero Plant Store API")


app = FastAPI(
    title="Hero Plant Store API",
    description="Full backend API for Hero Plant Store — plants, orders, AI care, garden services.",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────
origins = settings.ALLOWED_ORIGINS
if isinstance(origins, str):
    import json
    try:
        origins = json.loads(origins)
    except Exception:
        origins = [o.strip() for o in origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routes ────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "version": "1.0.0", "environment": settings.ENVIRONMENT}
