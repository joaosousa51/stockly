from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.product import Product
from app.models.movement import Movement, MovementType
from app.schemas.product import ProductResponse
from app.schemas.movement import MovementResponse
from app.services import product_service, movement_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


class DashboardStats(BaseModel):
    """Métricas do dashboard"""
    total_products: int
    total_quantity: int
    low_stock_count: int
    total_value: float
    entries_today: int
    exits_today: int


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Retorna métricas gerais do estoque"""

    # Total de produtos
    total_result = await db.execute(select(func.count(Product.id)))
    total_products = total_result.scalar() or 0

    # Quantidade total em estoque
    qty_result = await db.execute(select(func.coalesce(func.sum(Product.quantity), 0)))
    total_quantity = qty_result.scalar() or 0

    # Produtos com estoque baixo
    low_result = await db.execute(
        select(func.count(Product.id)).where(Product.quantity <= Product.min_stock)
    )
    low_stock_count = low_result.scalar() or 0

    # Valor total do estoque
    value_result = await db.execute(
        select(func.coalesce(func.sum(Product.price * Product.quantity), 0))
    )
    total_value = round(value_result.scalar() or 0, 2)

    # Movimentações de hoje
    from datetime import date
    today = date.today()

    entries_result = await db.execute(
        select(func.count(Movement.id)).where(
            Movement.type == MovementType.ENTRADA,
            func.date(Movement.created_at) == today,
        )
    )
    entries_today = entries_result.scalar() or 0

    exits_result = await db.execute(
        select(func.count(Movement.id)).where(
            Movement.type == MovementType.SAIDA,
            func.date(Movement.created_at) == today,
        )
    )
    exits_today = exits_result.scalar() or 0

    return DashboardStats(
        total_products=total_products,
        total_quantity=total_quantity,
        low_stock_count=low_stock_count,
        total_value=total_value,
        entries_today=entries_today,
        exits_today=exits_today,
    )


@router.get("/low-stock", response_model=list[ProductResponse])
async def get_low_stock(db: AsyncSession = Depends(get_db)):
    """Retorna produtos com estoque baixo"""
    products, _ = await product_service.get_products(db, low_stock_only=True, limit=10)
    return [ProductResponse.model_validate(p) for p in products]


@router.get("/recent", response_model=list[MovementResponse])
async def get_recent_movements(db: AsyncSession = Depends(get_db)):
    """Retorna movimentações mais recentes"""
    movements = await movement_service.get_recent_movements(db, limit=10)
    return [
        MovementResponse(
            id=m.id,
            product_id=m.product_id,
            product_name=m.product.name if m.product else None,
            type=m.type,
            quantity=m.quantity,
            notes=m.notes,
            created_at=m.created_at,
        )
        for m in movements
    ]
