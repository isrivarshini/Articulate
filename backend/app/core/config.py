from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/articulate"

    # Auth
    secret_key: str = "change-me-to-a-real-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours

    # Whisper
    whisper_model: str = "base"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()