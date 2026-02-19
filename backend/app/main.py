from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import products, movements, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cria as tabelas no startup (fallback se não usar migrations)"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para controle de estoque com FastAPI, SQLAlchemy e PostgreSQL",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(products.router)
app.include_router(movements.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Verificar se a API está funcionando"""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
