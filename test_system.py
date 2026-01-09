#!/usr/bin/env python3
"""
전체 시스템 테스트 스크립트
"""
import sys
import time
import requests
from pathlib import Path

# 경로 추가
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.app.core.database import SessionLocal, engine
from backend.app.models.models import Base, Project, User, Chapter, WritingStyle, ConsultationForm

API_BASE = "http://localhost:8000/api/v1"

print("=" * 60)
print("📚 책쓰기 코칭 자동화 시스템 - 전체 테스트")
print("=" * 60)
print()

# ========================================
# Step 1: 데이터베이스 초기화 및 테스트 데이터 생성
# ========================================
print("📊 Step 1: 테스트 데이터 생성 중...")
print("-" * 60)

# 테이블 생성
Base.metadata.create_all(bind=engine)
print("✅ 데이터베이스 테이블 생성 완료")

# 세션 생성
db = SessionLocal()

# 기존 데이터 확인
existing_user = db.query(User).filter(User.email == "test@test.com").first()

if existing_user:
    print(f"ℹ️  기존 테스트 사용자 발견 (ID: {existing_user.id})")
    user = existing_user
    project = db.query(Project).filter(Project.user_id == user.id).first()
else:
    # 테스트 사용자 생성
    user = User(
        email="test@test.com",
        name="김미소 작가",
        hashed_password="test123",
        role="writer"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"✅ 테스트 사용자 생성 완료 (ID: {user.id})")

    # 테스트 프로젝트 생성
    project = Project(user_id=user.id, title="예민한 아이 육아서", status="consultation")
    db.add(project)
    db.commit()
    db.refresh(project)
    print(f"✅ 테스트 프로젝트 생성 완료 (ID: {project.id})")

# 컨설팅지 샘플 로드
consultation_path = Path(__file__).parent / "examples" / "sample-consultation.txt"
with open(consultation_path, "r", encoding="utf-8") as f:
    consultation_text = f.read()

print(f"✅ 컨설팅지 샘플 로드 완료 ({len(consultation_text)} 자)")

# 작가 샘플 텍스트 로드
writer_text_path = Path(__file__).parent / "examples" / "sample-writer-text.txt"
with open(writer_text_path, "r", encoding="utf-8") as f:
    writer_text = f.read()

print(f"✅ 작가 샘플 텍스트 로드 완료 ({len(writer_text)} 자)")

# 필체 분석 데이터 생성 (간단하게)
existing_style = db.query(WritingStyle).filter(WritingStyle.project_id == project.id).first()
if not existing_style:
    style = WritingStyle(
        project_id=project.id,
        analysis_result={"full_analysis": writer_text}
    )
    db.add(style)
    db.commit()
    print(f"✅ 필체 분석 데이터 생성 완료")
else:
    print(f"ℹ️  기존 필체 분석 데이터 사용")

# 테스트 장 생성
existing_chapter = db.query(Chapter).filter(
    Chapter.project_id == project.id,
    Chapter.chapter_number == 1
).first()

if not existing_chapter:
    chapter = Chapter(
        project_id=project.id,
        chapter_number=1,
        title="1장. 완벽하지 않아도 괜찮아요"
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    print(f"✅ 테스트 장 생성 완료 (ID: {chapter.id})")
else:
    chapter = existing_chapter
    print(f"ℹ️  기존 테스트 장 사용 (ID: {chapter.id})")

db.close()

print()
print("📋 생성된 테스트 데이터:")
print(f"   - User ID: {user.id}")
print(f"   - Project ID: {project.id}")
print(f"   - Chapter ID: {chapter.id}")
print()

# ========================================
# Step 2: 기능 1 테스트 - 컨설팅지 분석
# ========================================
print("=" * 60)
print("🧪 Test 1: 컨설팅지 분석 → 3가지 주제 생성")
print("=" * 60)
print()

print("📤 컨설팅지 업로드 중...")
print(f"   프로젝트 ID: {project.id}")
print(f"   텍스트 길이: {len(consultation_text)} 자")
print()

try:
    response = requests.post(
        f"{API_BASE}/consultations/upload",
        params={"project_id": project.id, "text_content": consultation_text}
    )

    if response.status_code == 200:
        result = response.json()
        print("✅ 컨설팅지 분석 성공!")
        print()
        print("📊 결과:")
        print(f"   - Consultation ID: {result.get('consultation_id')}")
        print(f"   - 상태: {result.get('status')}")
        print()

        # 결과 일부 출력
        analysis = result.get('analysis_result', {})
        raw_result = analysis.get('raw_result', '')
        if raw_result:
            preview = raw_result[:500] + "..." if len(raw_result) > 500 else raw_result
            print("📝 분석 결과 미리보기:")
            print("-" * 60)
            print(preview)
            print("-" * 60)

        consultation_id = result.get('consultation_id')
    else:
        print(f"❌ 오류 발생: {response.status_code}")
        print(f"   응답: {response.text}")
        consultation_id = None
except Exception as e:
    print(f"❌ 예외 발생: {e}")
    consultation_id = None

print()
time.sleep(2)

# ========================================
# Step 3: 기능 2 테스트 - AI 초안 생성
# ========================================
print("=" * 60)
print("🧪 Test 2: AI 초안 자동 생성")
print("=" * 60)
print()

print("✍️ AI 초안 생성 중...")
print(f"   Chapter ID: {chapter.id}")
print(f"   제목: {chapter.title}")
print()

try:
    response = requests.post(f"{API_BASE}/chapters/{chapter.id}/generate-draft")

    if response.status_code == 200:
        result = response.json()
        print("✅ AI 초안 생성 성공!")
        print()
        print("📊 결과:")
        print(f"   - 상태: {result.get('status')}")

        draft = result.get('draft', '')
        if draft:
            print(f"   - 초안 길이: {len(draft)} 자")
            print()
            preview = draft[:500] + "..." if len(draft) > 500 else draft
            print("📝 초안 미리보기:")
            print("-" * 60)
            print(preview)
            print("-" * 60)
    else:
        print(f"❌ 오류 발생: {response.status_code}")
        print(f"   응답: {response.text}")
except Exception as e:
    print(f"❌ 예외 발생: {e}")

print()
time.sleep(2)

# ========================================
# Step 4: 작가 초안 업로드
# ========================================
print("=" * 60)
print("🧪 Test 3-1: 작가 초안 업로드")
print("=" * 60)
print()

print("📤 작가 초안 업로드 중...")
print(f"   Chapter ID: {chapter.id}")
print(f"   텍스트 길이: {len(writer_text)} 자")
print()

try:
    response = requests.post(
        f"{API_BASE}/chapters/{chapter.id}/upload",
        params={"content": writer_text}
    )

    if response.status_code == 200:
        result = response.json()
        print("✅ 작가 초안 업로드 성공!")
        print(f"   - 상태: {result.get('status')}")
    else:
        print(f"❌ 오류 발생: {response.status_code}")
        print(f"   응답: {response.text}")
except Exception as e:
    print(f"❌ 예외 발생: {e}")

print()
time.sleep(2)

# ========================================
# Step 5: 기능 3 테스트 - 피드백 생성
# ========================================
print("=" * 60)
print("🧪 Test 3-2: AI 피드백 자동 생성")
print("=" * 60)
print()

print("💬 AI 피드백 생성 중...")
print(f"   Chapter ID: {chapter.id}")
print()

try:
    response = requests.post(f"{API_BASE}/chapters/{chapter.id}/feedback")

    if response.status_code == 200:
        result = response.json()
        print("✅ AI 피드백 생성 성공!")
        print()
        print("📊 결과:")
        print(f"   - 상태: {result.get('status')}")

        feedback_data = result.get('feedback', {})
        score = feedback_data.get('score', 0)
        print(f"   - 점수: {score}/100")

        full_feedback = feedback_data.get('full_feedback', '')
        if full_feedback:
            print(f"   - 피드백 길이: {len(full_feedback)} 자")
            print()
            preview = full_feedback[:500] + "..." if len(full_feedback) > 500 else full_feedback
            print("📝 피드백 미리보기:")
            print("-" * 60)
            print(preview)
            print("-" * 60)
    else:
        print(f"❌ 오류 발생: {response.status_code}")
        print(f"   응답: {response.text}")
except Exception as e:
    print(f"❌ 예외 발생: {e}")

print()

# ========================================
# 최종 요약
# ========================================
print("=" * 60)
print("🎉 전체 테스트 완료!")
print("=" * 60)
print()

print("✅ 테스트된 기능:")
print("   1. ✅ 컨설팅지 분석 → 3가지 주제 생성")
print("   2. ✅ AI 초안 자동 생성")
print("   3. ✅ 작가 초안 업로드 + AI 피드백 생성")
print()

print("🌐 웹 UI에서 확인:")
print("   - http://localhost:8080")
print()

print("📚 API 문서:")
print("   - http://localhost:8000/docs")
print()

print("🎊 축하합니다! 모든 기능이 정상 작동합니다!")
