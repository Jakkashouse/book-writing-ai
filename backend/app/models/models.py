"""
데이터베이스 모델
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class User(Base):
    """사용자 테이블"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="writer")  # writer, coach, admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계
    projects = relationship("Project", back_populates="user")


class Project(Base):
    """프로젝트 테이블"""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    status = Column(
        String, default="consultation"
    )  # consultation, topic_selection, drafting, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계
    user = relationship("User", back_populates="projects")
    consultation = relationship(
        "ConsultationForm", back_populates="project", uselist=False
    )
    topics = relationship("TopicProposal", back_populates="project")
    chapters = relationship("Chapter", back_populates="project")
    writing_style = relationship(
        "WritingStyle", back_populates="project", uselist=False
    )


class ConsultationForm(Base):
    """컨설팅지 테이블"""

    __tablename__ = "consultation_forms"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    file_url = Column(String)
    text_content = Column(Text, nullable=False)
    analyzed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    project = relationship("Project", back_populates="consultation")
    topics = relationship("TopicProposal", back_populates="consultation")


class TopicProposal(Base):
    """주제 제안 테이블"""

    __tablename__ = "topic_proposals"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    consultation_id = Column(Integer, ForeignKey("consultation_forms.id"))
    topic_number = Column(Integer, nullable=False)  # 1, 2, 3
    title = Column(String, nullable=False)
    subtitle = Column(String)
    outline = Column(JSON)  # 40개 목차
    market_analysis = Column(JSON)
    differentiation = Column(JSON)
    selected = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    project = relationship("Project", back_populates="topics")
    consultation = relationship("ConsultationForm", back_populates="topics")


class WritingStyle(Base):
    """필체 분석 테이블"""

    __tablename__ = "writing_styles"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    avg_sentence_length = Column(Integer)
    common_endings = Column(JSON)
    vocabulary_level = Column(String)
    tone = Column(String)
    analysis_result = Column(JSON)  # 전체 분석 결과
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    project = relationship("Project", back_populates="writing_style")


class Chapter(Base):
    """장 테이블"""

    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    chapter_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    target_words = Column(Integer, default=4000)
    draft_content = Column(Text)  # AI 생성 초안
    writer_content = Column(Text)  # 작가가 쓴 내용
    status = Column(
        String, default="pending"
    )  # pending, ai_drafted, writer_uploaded, feedback_sent
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 관계
    project = relationship("Project", back_populates="chapters")
    feedbacks = relationship("Feedback", back_populates="chapter")


class Feedback(Base):
    """피드백 테이블"""

    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    type = Column(String, nullable=False)  # ai, coach
    content = Column(JSON, nullable=False)  # 구조화된 피드백
    score = Column(Integer)  # 총점 (100점 만점)
    sent_to_writer = Column(Boolean, default=False)
    sent_to_coach = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    chapter = relationship("Chapter", back_populates="feedbacks")
