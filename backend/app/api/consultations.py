"""
컨설팅지 관련 API
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json

from ..core.database import get_db
from ..models.models import ConsultationForm, Project, TopicProposal, User
from ..services.ai_service import ai_service

router = APIRouter()


@router.post("/upload")
async def upload_consultation(
    project_id: int,
    file: UploadFile = File(None),
    text_content: str = None,
    db: Session = Depends(get_db),
):
    """
    컨설팅지 업로드 및 분석

    기능:
    1. 파일 또는 텍스트 업로드
    2. AI 자동 분석
    3. 3가지 주제 + 목차 40개 생성
    4. DB 저장
    """
    # 프로젝트 확인
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    # 텍스트 추출
    if file:
        content = await file.read()
        consultation_text = content.decode("utf-8")
    elif text_content:
        consultation_text = text_content
    else:
        raise HTTPException(
            status_code=400, detail="파일 또는 텍스트를 제공해야 합니다"
        )

    # 컨설팅지 저장
    consultation = ConsultationForm(
        project_id=project_id,
        file_url=file.filename if file else None,
        text_content=consultation_text,
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # AI 분석
    try:
        analysis_result = ai_service.analyze_consultation(consultation_text)

        # 분석 완료 시간 업데이트
        consultation.analyzed_at = datetime.now()
        db.commit()

        # TODO: 여기서 3가지 주제를 파싱해서 TopicProposal로 저장
        # 간단하게 먼저 raw 결과만 반환

        return {
            "consultation_id": consultation.id,
            "status": "분석 완료",
            "analysis_result": analysis_result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 분석 오류: {str(e)}")


@router.get("/{consultation_id}")
def get_consultation(consultation_id: int, db: Session = Depends(get_db)):
    """컨설팅지 조회"""
    consultation = (
        db.query(ConsultationForm)
        .filter(ConsultationForm.id == consultation_id)
        .first()
    )

    if not consultation:
        raise HTTPException(status_code=404, detail="컨설팅지를 찾을 수 없습니다")

    return consultation


@router.get("/{consultation_id}/topics")
def get_topics(consultation_id: int, db: Session = Depends(get_db)):
    """컨설팅지의 추천 주제 조회"""
    topics = (
        db.query(TopicProposal)
        .filter(TopicProposal.consultation_id == consultation_id)
        .all()
    )

    return topics
