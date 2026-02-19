from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação carregadas do .env"""

    DATABASE_URL: str = "postgresql+asyncpg://stockly_user:stockly_pass@localhost:5432/stockly"
    CORS_ORIGINS: str = "http://localhost:5173"
    APP_NAME: str = "Stockly API"
    APP_VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"


settings = Settings()
