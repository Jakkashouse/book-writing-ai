"""
Markdown to PDF Converter
마크다운 파일을 프린트 가능한 PDF로 변환
"""

from markdown import markdown
from weasyprint import HTML, CSS
from pathlib import Path

def convert_markdown_to_pdf(md_file, pdf_file):
    """마크다운 파일을 PDF로 변환"""

    # 마크다운 파일 읽기
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # 마크다운을 HTML로 변환
    html_content = markdown(md_content, extensions=['tables', 'fenced_code'])

    # CSS 스타일 정의 (프린트 최적화)
    css_content = """
    @page {
        size: A4;
        margin: 2cm;
    }

    body {
        font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
        font-size: 10pt;
        line-height: 1.4;
        color: #333;
    }

    h1 {
        font-size: 18pt;
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 2px solid #333;
    }

    h2 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 15px;
        margin-bottom: 8px;
        color: #444;
    }

    h3 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 6px;
        color: #555;
    }

    h4 {
        font-size: 11pt;
        font-weight: bold;
        margin-top: 8px;
        margin-bottom: 4px;
        color: #666;
    }

    p {
        margin: 4px 0;
    }

    ul, ol {
        margin: 5px 0;
        padding-left: 20px;
    }

    li {
        margin: 2px 0;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size: 9pt;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 6px 8px;
        text-align: left;
    }

    th {
        background-color: #f0f0f0;
        font-weight: bold;
    }

    hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 15px 0;
    }

    blockquote {
        border-left: 3px solid #ccc;
        padding-left: 10px;
        margin: 10px 0;
        color: #666;
        font-style: italic;
    }

    code {
        background-color: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 9pt;
    }

    strong {
        font-weight: bold;
        color: #000;
    }

    /* 체크박스 스타일 */
    input[type="checkbox"] {
        margin-right: 5px;
    }

    /* 페이지 브레이크 */
    .page-break {
        page-break-after: always;
    }
    """

    # HTML 템플릿
    html_template = f"""
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <title>박일섭 작가 홍보 체크리스트</title>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    # PDF 생성
    HTML(string=html_template).write_pdf(
        pdf_file,
        stylesheets=[CSS(string=css_content)]
    )

    print(f"✅ PDF 파일이 생성되었습니다: {pdf_file}")

if __name__ == "__main__":
    # 파일 경로
    md_file = Path(__file__).parent / "박일섭작가_홍보체크리스트.md"
    pdf_file = Path(__file__).parent / "박일섭작가_홍보체크리스트.pdf"

    # 변환 실행
    convert_markdown_to_pdf(md_file, pdf_file)
