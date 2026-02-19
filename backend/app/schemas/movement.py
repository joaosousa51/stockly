from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.models.movement import MovementType


class MovementCreate(BaseModel):
    """Schema para criação de Movimentação"""
    product_id: int = Field(..., examples=[1])
    type: MovementType = Field(..., examples=["entrada"])
    quantity: int = Field(..., gt=0, examples=[10])
    notes: str | None = Field(None, examples=["Compra do fornecedor X"])


class MovementResponse(BaseModel):
    """Schema de resposta da Movimentação"""
    id: int
    product_id: int
    product_name: str | None = None
    type: MovementType
    quantity: int
    notes: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MovementListResponse(BaseModel):
    """Schema de resposta paginada"""
    data: list[MovementResponse]
    total: int
