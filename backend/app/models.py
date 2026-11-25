from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app: str


# TODO: Add session, stage, transcript, and evaluation Pydantic models
