from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.movement import Movement, MovementType
from app.models.product import Product
from app.schemas.movement import MovementCreate


async def create_movement(db: AsyncSession, data: MovementCreate) -> Movement:
    """Registrar movimentação e atualizar estoque do produto"""

    # Buscar produto
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()

    if not product:
        raise ValueError(f"Produto com ID {data.product_id} não encontrado")

    # Validar saída
    if data.type == MovementType.SAIDA:
        if product.quantity < data.quantity:
            raise ValueError(
                f"Estoque insuficiente. Disponível: {product.quantity}, solicitado: {data.quantity}"
            )
        product.quantity -= data.quantity
    else:
        product.quantity += data.quantity

    # Criar movimentação
    movement = Movement(**data.model_dump())
    db.add(movement)
    await db.flush()
    await db.refresh(movement)

    return movement


async def get_movements(
    db: AsyncSession,
    product_id: int | None = None,
    movement_type: str | None = None,
    limit: int = 50,
) -> tuple[list[Movement], int]:
    """Listar movimentações com filtros"""

    query = select(Movement).options(joinedload(Movement.product))

    if product_id:
        query = query.where(Movement.product_id == product_id)

    if movement_type:
        query = query.where(Movement.type == movement_type)

    # Contagem total
    count_query = select(func.count()).select_from(
        select(Movement.id).where(
            *([Movement.product_id == product_id] if product_id else []),
            *([Movement.type == movement_type] if movement_type else []),
        ).subquery()
    )
    total = (await db.execute(count_query)).scalar() or 0

    # Ordenar por mais recente
    query = query.order_by(Movement.created_at.desc()).limit(limit)

    result = await db.execute(query)
    movements = list(result.scalars().unique().all())

    return movements, total


async def get_recent_movements(db: AsyncSession, limit: int = 10) -> list[Movement]:
    """Buscar movimentações mais recentes"""
    query = (
        select(Movement)
        .options(joinedload(Movement.product))
        .order_by(Movement.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().unique().all())
