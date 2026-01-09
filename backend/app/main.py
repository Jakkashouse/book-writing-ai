"""
FastAPI 메인 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .core.config import settings
from .core.database import engine, Base
from .api import consultations, chapters

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 생성
app = FastAPI(title=settings.PROJECT_NAME)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(
    consultations.router, prefix="/api/v1/consultations", tags=["컨설팅지"]
)
app.include_router(chapters.router, prefix="/api/v1/chapters", tags=["장"])


# 루트 엔드포인트
@app.get("/")
async def root():
    """API 루트"""
    return {
        "message": "책쓰기 코칭 자동화 API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# 헬스 체크
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {"status": "healthy"}


# 정적 파일 서빙 (프론트엔드)
# static_dir = Path(__file__).parent.parent.parent / "frontend" / "dist"
# if static_dir.exists():
#     app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
