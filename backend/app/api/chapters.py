"""
장(Chapter) 관련 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.models import Chapter, Project, WritingStyle, Feedback
from ..services.ai_service import ai_service

router = APIRouter()


@router.post("/{chapter_id}/generate-draft")
async def generate_draft(chapter_id: int, db: Session = Depends(get_db)):
    """
    AI 초안 자동 생성

    기능:
    1. 필체 분석 결과 조회
    2. 작가 스타일로 초안 생성 (4,000자)
    3. DB 저장
    """
    # 장 조회
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="장을 찾을 수 없습니다")

    # 필체 분석 조회
    writing_style = (
        db.query(WritingStyle)
        .filter(WritingStyle.project_id == chapter.project_id)
        .first()
    )

    if not writing_style:
        raise HTTPException(
            status_code=400, detail="필체 분석이 아직 완료되지 않았습니다"
        )

    # AI 초안 생성
    try:
        draft = ai_service.write_draft(
            writing_style_analysis=writing_style.analysis_result.get(
                "full_analysis", ""
            ),
            chapter_title=chapter.title,
            core_message="",  # TODO: 필요 시 추가
        )

        # 초안 저장
        chapter.draft_content = draft
        chapter.status = "ai_drafted"
        db.commit()

        return {"chapter_id": chapter.id, "draft": draft, "status": "초안 생성 완료"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"초안 생성 오류: {str(e)}")


@router.post("/{chapter_id}/upload")
async def upload_writer_draft(
    chapter_id: int, content: str, db: Session = Depends(get_db)
):
    """
    작가 초안 업로드

    기능:
    1. 작가가 직접 쓴 초안 저장
    2. 상태 업데이트
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="장을 찾을 수 없습니다")

    chapter.writer_content = content
    chapter.status = "writer_uploaded"
    db.commit()

    return {"chapter_id": chapter.id, "status": "작가 초안 업로드 완료"}


@router.post("/{chapter_id}/feedback")
async def generate_feedback(chapter_id: int, db: Session = Depends(get_db)):
    """
    AI 피드백 자동 생성

    기능:
    1. 작가 초안 분석
    2. 100점 만점 평가 + 개선안 생성
    3. DB 저장
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="장을 찾을 수 없습니다")

    if not chapter.writer_content:
        raise HTTPException(status_code=400, detail="작가 초안이 아직 없습니다")

    # AI 피드백 생성
    try:
        feedback_result = ai_service.generate_feedback(
            draft_content=chapter.writer_content, chapter_title=chapter.title
        )

        # 피드백 저장
        feedback = Feedback(
            chapter_id=chapter.id,
            type="ai",
            content=feedback_result,
            score=feedback_result.get("score", 0),
            sent_to_writer=True,
            sent_to_coach=True,
        )
        db.add(feedback)

        chapter.status = "feedback_sent"
        db.commit()

        return {
            "chapter_id": chapter.id,
            "feedback": feedback_result,
            "status": "피드백 생성 완료",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"피드백 생성 오류: {str(e)}")


@router.get("/{chapter_id}")
def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    """장 조회"""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="장을 찾을 수 없습니다")

    return chapter


@router.get("/{chapter_id}/feedbacks")
def get_feedbacks(chapter_id: int, db: Session = Depends(get_db)):
    """장의 피드백 목록 조회"""
    feedbacks = db.query(Feedback).filter(Feedback.chapter_id == chapter_id).all()
    return feedbacks
