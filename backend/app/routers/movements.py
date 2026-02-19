from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.movement import MovementCreate, MovementResponse, MovementListResponse
from app.services import movement_service

router = APIRouter(prefix="/api/movements", tags=["Movimentações"])


@router.get("", response_model=MovementListResponse)
async def list_movements(
    product_id: int | None = Query(None, description="Filtrar por produto"),
    type: str | None = Query(None, description="Filtrar por tipo (entrada/saida)"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Listar movimentações de estoque"""
    movements, total = await movement_service.get_movements(
        db, product_id=product_id, movement_type=type, limit=limit,
    )
    return MovementListResponse(
        data=[
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
        ],
        total=total,
    )


@router.post("", response_model=MovementResponse, status_code=201)
async def create_movement(data: MovementCreate, db: AsyncSession = Depends(get_db)):
    """Registrar entrada ou saída de estoque"""
    try:
        movement = await movement_service.create_movement(db, data)
        return MovementResponse(
            id=movement.id,
            product_id=movement.product_id,
            product_name=None,
            type=movement.type,
            quantity=movement.quantity,
            notes=movement.notes,
            created_at=movement.created_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
