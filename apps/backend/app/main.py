import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import diagnose

DEFAULT_CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
logger = logging.getLogger("repairmate.backend")


def cors_origins() -> list[str]:
    configured = os.getenv("CORS_ALLOW_ORIGINS")
    if not configured:
        return DEFAULT_CORS_ORIGINS
    return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]


def create_app() -> FastAPI:
    origins = cors_origins()
    logger.warning("CORS allow origins: %s", ", ".join(origins))

    app = FastAPI(title="RepairMate API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
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
