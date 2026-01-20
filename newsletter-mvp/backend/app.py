"""
작가의아침 뉴스레터 시스템 MVP
- 구독자 관리
- 뉴스레터 발송
- 관리자 기능
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import json
import hashlib
import secrets

app = Flask(__name__, static_folder='../frontend', template_folder='../templates')
CORS(app)

DATABASE = 'newsletter.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """데이터베이스 초기화"""
    conn = get_db()
    cursor = conn.cursor()

    # 구독자 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            unsubscribe_token TEXT UNIQUE
        )
    ''')

    # 뉴스레터 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS newsletters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            book_title TEXT,
            author TEXT,
            quote TEXT NOT NULL,
            commentary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sent_at TIMESTAMP,
            sent_count INTEGER DEFAULT 0
        )
    ''')

    # 발송 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS send_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            newsletter_id INTEGER,
            subscriber_id INTEGER,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT,
            FOREIGN KEY (newsletter_id) REFERENCES newsletters(id),
            FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
        )
    ''')

    conn.commit()
    conn.close()

# ==================== 구독자 API ====================

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    """이메일 구독 신청"""
    data = request.json
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()

    if not email:
        return jsonify({'success': False, 'message': '이메일을 입력해주세요.'}), 400

    unsubscribe_token = secrets.token_urlsafe(32)

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO subscribers (email, name, unsubscribe_token) VALUES (?, ?, ?)',
            (email, name, unsubscribe_token)
        )
        conn.commit()
        conn.close()
        return jsonify({
            'success': True,
            'message': f'{name or email}님, 구독해주셔서 감사합니다!'
        })
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': '이미 구독 중인 이메일입니다.'}), 400

@app.route('/api/unsubscribe/<token>', methods=['GET'])
def unsubscribe(token):
    """구독 취소"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE subscribers SET is_active = 0 WHERE unsubscribe_token = ?',
        (token,)
    )
    if cursor.rowcount > 0:
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '구독이 취소되었습니다.'})
    conn.close()
    return jsonify({'success': False, 'message': '유효하지 않은 링크입니다.'}), 404

@app.route('/api/subscribers', methods=['GET'])
def get_subscribers():
    """구독자 목록 조회 (관리자용)"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, name, subscribed_at, is_active FROM subscribers ORDER BY subscribed_at DESC')
    subscribers = [dict(row) for row in cursor.fetchall()]
    conn.close()

    active_count = sum(1 for s in subscribers if s['is_active'])
    return jsonify({
        'subscribers': subscribers,
        'total': len(subscribers),
        'active': active_count
    })

# ==================== 뉴스레터 API ====================

@app.route('/api/newsletters', methods=['GET'])
def get_newsletters():
    """뉴스레터 목록 조회"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM newsletters ORDER BY created_at DESC')
    newsletters = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'newsletters': newsletters})

@app.route('/api/newsletters', methods=['POST'])
def create_newsletter():
    """새 뉴스레터 작성"""
    data = request.json

    title = data.get('title', '').strip()
    book_title = data.get('book_title', '').strip()
    author = data.get('author', '').strip()
    quote = data.get('quote', '').strip()
    commentary = data.get('commentary', '').strip()

    if not quote:
        return jsonify({'success': False, 'message': '문장을 입력해주세요.'}), 400

    if not title:
        title = f"오늘의 문장 - {datetime.now().strftime('%Y년 %m월 %d일')}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO newsletters (title, book_title, author, quote, commentary)
        VALUES (?, ?, ?, ?, ?)
    ''', (title, book_title, author, quote, commentary))
    newsletter_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': '뉴스레터가 저장되었습니다.',
        'newsletter_id': newsletter_id
    })

@app.route('/api/newsletters/<int:newsletter_id>/send', methods=['POST'])
def send_newsletter(newsletter_id):
    """뉴스레터 발송"""
    conn = get_db()
    cursor = conn.cursor()

    # 뉴스레터 조회
    cursor.execute('SELECT * FROM newsletters WHERE id = ?', (newsletter_id,))
    newsletter = cursor.fetchone()
    if not newsletter:
        conn.close()
        return jsonify({'success': False, 'message': '뉴스레터를 찾을 수 없습니다.'}), 404

    # 활성 구독자 조회
    cursor.execute('SELECT * FROM subscribers WHERE is_active = 1')
    subscribers = cursor.fetchall()

    if not subscribers:
        conn.close()
        return jsonify({'success': False, 'message': '구독자가 없습니다.'}), 400

    # 이메일 설정 (환경변수에서)
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER', '')
    smtp_password = os.getenv('SMTP_PASSWORD', '')

    sent_count = 0
    errors = []

    # 실제 발송 (SMTP 설정이 있는 경우)
    if smtp_user and smtp_password:
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_password)

            for subscriber in subscribers:
                try:
                    msg = create_email_html(dict(newsletter), dict(subscriber))
                    server.send_message(msg)

                    cursor.execute('''
                        INSERT INTO send_logs (newsletter_id, subscriber_id, status)
                        VALUES (?, ?, 'sent')
                    ''', (newsletter_id, subscriber['id']))
                    sent_count += 1
                except Exception as e:
                    errors.append(f"{subscriber['email']}: {str(e)}")
                    cursor.execute('''
                        INSERT INTO send_logs (newsletter_id, subscriber_id, status)
                        VALUES (?, ?, ?)
                    ''', (newsletter_id, subscriber['id'], f'error: {str(e)}'))

            server.quit()
        except Exception as e:
            conn.close()
            return jsonify({'success': False, 'message': f'SMTP 연결 실패: {str(e)}'}), 500
    else:
        # SMTP 설정이 없으면 시뮬레이션
        sent_count = len(subscribers)
        for subscriber in subscribers:
            cursor.execute('''
                INSERT INTO send_logs (newsletter_id, subscriber_id, status)
                VALUES (?, ?, 'simulated')
            ''', (newsletter_id, subscriber['id']))

    # 발송 정보 업데이트
    cursor.execute('''
        UPDATE newsletters SET sent_at = CURRENT_TIMESTAMP, sent_count = ?
        WHERE id = ?
    ''', (sent_count, newsletter_id))

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f'{sent_count}명에게 발송 완료!',
        'sent_count': sent_count,
        'errors': errors if errors else None
    })

def create_email_html(newsletter, subscriber):
    """이메일 HTML 생성"""
    unsubscribe_url = f"http://localhost:5000/api/unsubscribe/{subscriber['unsubscribe_token']}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Noto Sans KR', sans-serif; line-height: 1.8; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 40px; }}
            .logo {{ font-size: 24px; color: #e67e22; font-weight: bold; }}
            .date {{ color: #888; font-size: 14px; margin-top: 10px; }}
            .quote-box {{ background: #fef9e7; padding: 30px; border-left: 4px solid #e67e22; margin: 30px 0; }}
            .quote {{ font-size: 20px; font-style: italic; color: #2c3e50; }}
            .book-info {{ text-align: right; margin-top: 20px; color: #666; font-size: 14px; }}
            .commentary {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; }}
            .unsubscribe {{ color: #888; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">작가의아침</div>
                <div class="date">{datetime.now().strftime('%Y년 %m월 %d일')}</div>
            </div>

            <p>{subscriber['name'] or '독자'}님, 좋은 아침입니다.</p>
            <p>오늘 당신에게 전하고 싶은 문장입니다.</p>

            <div class="quote-box">
                <div class="quote">"{newsletter['quote']}"</div>
                <div class="book-info">
                    - {newsletter['author'] or '작자미상'},
                    《{newsletter['book_title'] or '무제'}》
                </div>
            </div>

            {f'<div class="commentary">{newsletter["commentary"]}</div>' if newsletter['commentary'] else ''}

            <p>오늘 하루도 좋은 문장과 함께하시길 바랍니다.</p>

            <div class="footer">
                <p>작가의아침 | 매일 아침, 작가가 건네는 한 문장</p>
                <p><a href="{unsubscribe_url}" class="unsubscribe">구독 취소</a></p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = newsletter['title']
    msg['From'] = os.getenv('SMTP_USER', 'newsletter@jakgaachim.com')
    msg['To'] = subscriber['email']
    msg.attach(MIMEText(html, 'html', 'utf-8'))

    return msg

# ==================== 통계 API ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """대시보드 통계"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) as total, SUM(is_active) as active FROM subscribers')
    sub_stats = dict(cursor.fetchone())

    cursor.execute('SELECT COUNT(*) as total, SUM(CASE WHEN sent_at IS NOT NULL THEN 1 ELSE 0 END) as sent FROM newsletters')
    news_stats = dict(cursor.fetchone())

    cursor.execute('SELECT SUM(sent_count) as total_sent FROM newsletters')
    sent_stats = dict(cursor.fetchone())

    conn.close()

    return jsonify({
        'subscribers': {
            'total': sub_stats['total'] or 0,
            'active': int(sub_stats['active'] or 0)
        },
        'newsletters': {
            'total': news_stats['total'] or 0,
            'sent': news_stats['sent'] or 0
        },
        'total_emails_sent': sent_stats['total_sent'] or 0
    })

# ==================== 프론트엔드 라우트 ====================

@app.route('/')
def index():
    """구독 페이지"""
    return send_from_directory('../frontend', 'subscribe.html')

@app.route('/admin')
def admin():
    """관리자 대시보드"""
    return send_from_directory('../frontend', 'admin.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """정적 파일 서빙"""
    return send_from_directory('../frontend', filename)

if __name__ == '__main__':
    init_db()
    print("\n" + "="*50)
    print("작가의아침 뉴스레터 시스템 MVP")
    print("="*50)
    print("구독 페이지: http://localhost:5000/")
    print("관리자 페이지: http://localhost:5000/admin")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)
