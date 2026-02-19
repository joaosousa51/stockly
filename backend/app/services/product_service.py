from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_products(
    db: AsyncSession,
    search: str | None = None,
    category: str | None = None,
    low_stock_only: bool = False,
    sort_by: str = "created_at",
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Product], int]:
    """Listar produtos com filtros e paginação"""

    query = select(Product)

    # Filtro de busca
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
            )
        )

    # Filtro de categoria
    if category:
        query = query.where(Product.category == category)

    # Filtro de estoque baixo
    if low_stock_only:
        query = query.where(Product.quantity <= Product.min_stock)

    # Contagem total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Ordenação
    sort_column = getattr(Product, sort_by, Product.created_at)
    if sort_by == "name":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Paginação
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    products = list(result.scalars().all())

    return products, total


async def get_product_by_id(db: AsyncSession, product_id: int) -> Product | None:
    """Buscar produto por ID"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def get_product_by_sku(db: AsyncSession, sku: str) -> Product | None:
    """Buscar produto por SKU"""
    result = await db.execute(select(Product).where(Product.sku == sku))
    return result.scalar_one_or_none()


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    """Criar novo produto"""
    product = Product(**data.model_dump())
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return product


async def update_product(db: AsyncSession, product: Product, data: ProductUpdate) -> Product:
    """Atualizar produto existente"""
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    await db.flush()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product: Product) -> None:
    """Excluir produto"""
    await db.delete(product)
    await db.flush()


async def get_categories(db: AsyncSession) -> list[str]:
    """Listar categorias únicas"""
    result = await db.execute(
        select(Product.category).distinct().order_by(Product.category)
    )
    return [row[0] for row in result.all()]
