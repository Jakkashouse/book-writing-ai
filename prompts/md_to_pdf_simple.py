"""
간단한 Markdown to PDF 변환기
reportlab 사용
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pathlib import Path
import re

# 한글 폰트 등록 (Windows 기본 폰트)
try:
    pdfmetrics.registerFont(TTFont('Malgun', 'malgun.ttf'))
    pdfmetrics.registerFont(TTFont('MalgunBd', 'malgunbd.ttf'))
    FONT_NAME = 'Malgun'
    FONT_BOLD = 'MalgunBd'
except:
    FONT_NAME = 'Helvetica'
    FONT_BOLD = 'Helvetica-Bold'

def parse_markdown_to_pdf(md_file, pdf_file):
    """마크다운 파일을 PDF로 변환"""

    # PDF 문서 생성
    doc = SimpleDocTemplate(
        str(pdf_file),
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    # 스타일 정의
    styles = getSampleStyleSheet()

    # 커스텀 스타일
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=FONT_BOLD,
        fontSize=16,
        textColor=colors.HexColor('#000000'),
        spaceAfter=12,
        spaceBefore=12,
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontName=FONT_BOLD,
        fontSize=13,
        textColor=colors.HexColor('#333333'),
        spaceAfter=8,
        spaceBefore=10,
    )

    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontName=FONT_BOLD,
        fontSize=11,
        textColor=colors.HexColor('#555555'),
        spaceAfter=6,
        spaceBefore=8,
    )

    h4_style = ParagraphStyle(
        'CustomH4',
        parent=styles['Heading4'],
        fontName=FONT_NAME,
        fontSize=10,
        textColor=colors.HexColor('#666666'),
        spaceAfter=4,
        spaceBefore=6,
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName=FONT_NAME,
        fontSize=9,
        leading=12,
    )

    # 마크다운 파일 읽기
    with open(md_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    story = []
    table_data = []
    in_table = False

    for line in lines:
        line = line.rstrip()

        # 빈 줄
        if not line:
            if in_table and table_data:
                # 테이블 종료
                t = Table(table_data)
                t.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, 0), FONT_BOLD),
                    ('FONTSIZE', (0, 0), (-1, -1), 8),
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ]))
                story.append(t)
                story.append(Spacer(1, 0.3*cm))
                table_data = []
                in_table = False
            story.append(Spacer(1, 0.2*cm))
            continue

        # 제목 처리
        if line.startswith('# '):
            text = line[2:].replace('📚', '').replace('📅', '').strip()
            story.append(Paragraph(text, title_style))
        elif line.startswith('## '):
            text = line[3:].replace('📊', '').replace('💡', '').replace('📝', '').strip()
            story.append(Paragraph(text, h2_style))
        elif line.startswith('### '):
            text = line[4:].strip()
            story.append(Paragraph(text, h3_style))
        elif line.startswith('#### '):
            text = line[5:].replace('□', '').strip()
            story.append(Paragraph('□ ' + text, h4_style))

        # 체크박스 항목
        elif line.startswith('- [ ]'):
            text = line[5:].strip()
            story.append(Paragraph('☐ ' + text, normal_style))

        # 일반 리스트
        elif line.startswith('- '):
            text = line[2:].strip()
            story.append(Paragraph('• ' + text, normal_style))

        # 테이블
        elif '|' in line and not line.startswith('**'):
            if '---' in line:
                continue
            cells = [cell.strip() for cell in line.split('|')]
            cells = [c for c in cells if c]  # 빈 셀 제거
            if cells:
                table_data.append(cells)
                in_table = True

        # 구분선
        elif line.startswith('---'):
            story.append(Spacer(1, 0.3*cm))
            story.append(Paragraph('_' * 80, normal_style))
            story.append(Spacer(1, 0.3*cm))

        # 볼드 텍스트
        elif line.startswith('**') and line.endswith('**'):
            text = line.strip('*')
            story.append(Paragraph(f'<b>{text}</b>', normal_style))

        # 일반 텍스트
        else:
            if not in_table:
                # 이모지 제거
                text = line.replace('🎉', '').replace('✅', '').replace('📋', '').strip()
                if text:
                    story.append(Paragraph(text, normal_style))

    # 마지막 테이블 처리
    if in_table and table_data:
        t = Table(table_data)
        t.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), FONT_BOLD),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(t)

    # PDF 생성
    doc.build(story)
    print(f"PDF created successfully: {pdf_file}")

if __name__ == "__main__":
    md_file = Path(__file__).parent / "박일섭작가_홍보체크리스트.md"
    pdf_file = Path(__file__).parent / "박일섭작가_홍보체크리스트.pdf"

    parse_markdown_to_pdf(md_file, pdf_file)
