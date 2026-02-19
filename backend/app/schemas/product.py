from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ProductBase(BaseModel):
    """Schema base para Produto"""
    name: str = Field(..., min_length=2, max_length=200, examples=["Teclado Mecânico RGB"])
    sku: str = Field(..., min_length=2, max_length=50, examples=["TEC-001"])
    description: str | None = Field(None, examples=["Teclado mecânico com switches blue"])
    category: str = Field(..., min_length=2, max_length=100, examples=["Periféricos"])
    price: float = Field(..., ge=0, examples=[299.90])
    quantity: int = Field(0, ge=0, examples=[50])
    min_stock: int = Field(5, ge=0, examples=[10])


class ProductCreate(ProductBase):
    """Schema para criação de Produto"""
    pass


class ProductUpdate(BaseModel):
    """Schema para atualização parcial de Produto"""
    name: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = None
    category: str | None = Field(None, min_length=2, max_length=100)
    price: float | None = Field(None, ge=0)
    min_stock: int | None = Field(None, ge=0)


class ProductResponse(ProductBase):
    """Schema de resposta com dados completos do Produto"""
    id: int
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    """Schema de resposta paginada"""
    data: list[ProductResponse]
    total: int
    page: int
    pages: int
