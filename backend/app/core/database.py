from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Engine assíncrono
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Session factory
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# Base para os models
class Base(DeclarativeBase):
    pass


# Dependency injection para rotas
async def get_db():
    """Fornece uma sessão do banco para cada requisição"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
