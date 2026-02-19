from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["Produtos"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    search: str | None = Query(None, description="Buscar por nome ou SKU"),
    category: str | None = Query(None, description="Filtrar por categoria"),
    low_stock: bool = Query(False, description="Apenas estoque baixo"),
    sort_by: str = Query("created_at", description="Ordenar por campo"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Listar produtos com filtros e paginação"""
    products, total = await product_service.get_products(
        db, search=search, category=category, low_stock_only=low_stock,
        sort_by=sort_by, page=page, limit=limit,
    )
    return ProductListResponse(
        data=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        pages=ceil(total / limit) if total > 0 else 1,
    )


@router.get("/categories", response_model=list[str])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Listar categorias disponíveis"""
    return await product_service.get_categories(db)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Buscar produto por ID"""
    product = await product_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return ProductResponse.model_validate(product)


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    """Criar novo produto"""
    # Verificar SKU duplicado
    existing = await product_service.get_product_by_sku(db, data.sku)
    if existing:
        raise HTTPException(status_code=400, detail="SKU já está em uso")

    product = await product_service.create_product(db, data)
    return ProductResponse.model_validate(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db),
):
    """Atualizar produto"""
    product = await product_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    updated = await product_service.update_product(db, product, data)
    return ProductResponse.model_validate(updated)


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Excluir produto"""
    product = await product_service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    await product_service.delete_product(db, product)
