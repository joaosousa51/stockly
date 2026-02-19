from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    """Model SQLAlchemy para Produto"""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    min_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relacionamento com movimentações
    movements = relationship("Movement", back_populates="product", cascade="all, delete-orphan")

    @property
    def is_low_stock(self) -> bool:
        """Verifica se o estoque está abaixo do mínimo"""
        return self.quantity <= self.min_stock

    def __repr__(self) -> str:
        return f"<Product {self.sku}: {self.name} (qty: {self.quantity})>"
