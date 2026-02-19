from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class MovementType(str, enum.Enum):
    """Tipo de movimentação"""
    ENTRADA = "entrada"
    SAIDA = "saida"


class Movement(Base):
    """Model SQLAlchemy para Movimentação de Estoque"""

    __tablename__ = "movements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    type: Mapped[MovementType] = mapped_column(Enum(MovementType), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relacionamento com produto
    product = relationship("Product", back_populates="movements")

    def __repr__(self) -> str:
        return f"<Movement {self.type.value}: {self.quantity} units of product #{self.product_id}>"
