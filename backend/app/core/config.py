"""
설정 파일
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # API 설정
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "책쓰기 코칭 자동화"

    # 데이터베이스
    DATABASE_URL: str = "sqlite:///./book_coaching.db"  # 간단하게 SQLite 사용

    # Claude API
    ANTHROPIC_API_KEY: str

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7일

    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]

    # 파일 업로드
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
