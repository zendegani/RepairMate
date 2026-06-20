from fastapi import APIRouter

from app.schemas import DiagnoseRequest, DiagnoseResponse
from app.services.pipeline import run_pipeline

router = APIRouter(prefix="/api", tags=["diagnose"])


@router.post("/diagnose", response_model=DiagnoseResponse)
def diagnose(request: DiagnoseRequest) -> DiagnoseResponse:
    return run_pipeline(request)
