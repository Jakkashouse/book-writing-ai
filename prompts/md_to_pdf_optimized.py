import markdown
from weasyprint import HTML, CSS
import os

def markdown_to_pdf_optimized(md_file, output_pdf=None, image_quality=30):
    """
    Markdown을 이미지 품질을 낮춘 PDF로 변환

    Args:
        md_file: 마크다운 파일 경로
        output_pdf: 출력 PDF 파일명 (None이면 자동 생성)
        image_quality: 이미지 품질 (1-100, 낮을수록 파일 크기 작음)
    """
    # 마크다운 파일 읽기
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # 마크다운을 HTML로 변환
    html_content = markdown.markdown(md_content, extensions=['tables', 'fenced_code'])

    # CSS 스타일 (한글 폰트 + 최적화)
    css_style = """
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');

        body {
            font-family: 'Noto Sans KR', sans-serif;
            line-height: 1.6;
            margin: 40px;
            font-size: 11pt;
            color: #333;
        }

        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            font-size: 24pt;
        }

        h2 {
            color: #34495e;
            border-bottom: 2px solid #95a5a6;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 18pt;
        }

        h3 {
            color: #555;
            margin-top: 20px;
            font-size: 14pt;
        }

        h4 {
            color: #666;
            font-size: 12pt;
        }

        ul, ol {
            margin-left: 20px;
        }

        li {
            margin-bottom: 8px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            font-size: 10pt;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }

        hr {
            border: none;
            border-top: 2px solid #eee;
            margin: 30px 0;
        }

        code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }

        /* 이미지 최적화 */
        img {
            max-width: 100%;
            height: auto;
            image-rendering: -webkit-optimize-contrast;
        }

        @page {
            margin: 2cm;
            size: A4;
        }
    </style>
    """

    # 완전한 HTML 문서 생성
    full_html = f"""
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        {css_style}
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """

    # 출력 파일명 결정
    if output_pdf is None:
        base_name = os.path.splitext(md_file)[0]
        output_pdf = f"{base_name}_optimized.pdf"

    # PDF 생성 (이미지 품질 낮춤)
    print(f"PDF 생성 중... (이미지 품질: {image_quality}%)")
    HTML(string=full_html).write_pdf(
        output_pdf,
        optimize_images=True,
        jpeg_quality=image_quality,
        presentational_hints=True
    )

    # 파일 크기 확인
    file_size_mb = os.path.getsize(output_pdf) / (1024 * 1024)
    print(f"✅ PDF 생성 완료: {output_pdf}")
    print(f"📊 파일 크기: {file_size_mb:.2f} MB")

    return output_pdf

if __name__ == "__main__":
    # 실행
    md_file = "박일섭작가_홍보체크리스트.md"

    if os.path.exists(md_file):
        # 이미지 품질 30%로 PDF 생성 (파일 크기 최소화)
        pdf_file = markdown_to_pdf_optimized(md_file, image_quality=30)
        print(f"\n🎉 변환 완료!")
        print(f"📄 원본: {md_file}")
        print(f"📄 PDF: {pdf_file}")
    else:
        print(f"❌ 파일을 찾을 수 없습니다: {md_file}")
