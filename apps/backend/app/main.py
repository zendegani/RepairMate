import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import diagnose

DEFAULT_CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
# Match this project's Vercel deployments (branch + preview URLs all start with
# the project prefix) so new preview domains don't need to be added to the env
# config one by one — without trusting arbitrary third-party *.vercel.app sites.
DEFAULT_CORS_ORIGIN_REGEX = r"https://repair-mate-[a-z0-9-]+\.vercel\.app"
logger = logging.getLogger("repairmate.backend")


def cors_origins() -> list[str]:
    configured = os.getenv("CORS_ALLOW_ORIGINS")
    if not configured:
        return DEFAULT_CORS_ORIGINS
    return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]


def cors_origin_regex() -> str:
    return os.getenv("CORS_ALLOW_ORIGIN_REGEX", DEFAULT_CORS_ORIGIN_REGEX)


def create_app() -> FastAPI:
    origins = cors_origins()
    origin_regex = cors_origin_regex()
    logger.warning(
        "CORS allow origins: %s (regex: %s)", ", ".join(origins), origin_regex
    )

    app = FastAPI(title="RepairMate API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(diagnose.router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
