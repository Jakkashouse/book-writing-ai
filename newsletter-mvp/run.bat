@echo off
echo ========================================
echo   작가의아침 뉴스레터 시스템 시작
echo ========================================
echo.

cd /d "%~dp0"

REM 가상환경 확인
if not exist "venv" (
    echo 가상환경을 생성합니다...
    python -m venv venv
)

REM 가상환경 활성화
call venv\Scripts\activate.bat

REM 패키지 설치
echo 필요한 패키지를 설치합니다...
pip install -r requirements.txt -q

echo.
echo 서버를 시작합니다...
echo 구독 페이지: http://localhost:5000/
echo 관리자 페이지: http://localhost:5000/admin
echo.
echo 종료하려면 Ctrl+C를 누르세요.
echo ========================================
echo.

cd backend
python app.py

pause
