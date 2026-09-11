# -*- coding: utf-8 -*-
"""범용 md → pdf 변환기 (Chrome headless 기반, 한글 완벽 지원).

기존 xhtml2pdf 백엔드는 한글 글리프 매핑 실패로 글자가 깨지는 사례가 있어
2026-05-16에 Chrome headless 기반으로 교체했습니다.

사용:
    python _convert_md_to_pdf.py <md파일경로> [pdf경로]
    python _convert_md_to_pdf.py <md파일1> <md파일2> ...   (다중 변환)
"""
import io
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown

# Windows cp949 콘솔에서 한글/이모지 출력 시 인코딩 에러 방지
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
except Exception:
    pass

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]


def find_chrome() -> str:
    for path in CHROME_CANDIDATES:
        if path and os.path.exists(path):
            return path
    raise FileNotFoundError(
        "Chrome/Edge 실행파일을 찾을 수 없습니다. "
        "CHROME_CANDIDATES에 경로를 추가하세요."
    )


CSS = """
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
html, body {
    font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: #222;
    margin: 0;
    padding: 0;
}
h1 {
    font-size: 20pt;
    color: #1a3a5c;
    border-bottom: 3px solid #c8924a;
    padding-bottom: 6px;
    margin-top: 0;
    margin-bottom: 14px;
}
h2 {
    font-size: 15pt;
    color: #1a3a5c;
    border-bottom: 1.2px solid #d6cfe5;
    padding-bottom: 4px;
    margin-top: 22px;
    margin-bottom: 10px;
    page-break-after: avoid;
}
h3 {
    font-size: 12.5pt;
    color: #2D5016;
    margin-top: 16px;
    margin-bottom: 6px;
    page-break-after: avoid;
}
h4 {
    font-size: 11pt;
    color: #555;
    margin-top: 12px;
    margin-bottom: 4px;
}
p { margin: 4px 0 8px 0; }
ul, ol { margin: 4px 0 10px 0; padding-left: 22px; }
li { margin: 3px 0; }
strong { color: #1a1a1a; font-weight: 700; }
em { color: #4a5568; }
hr { border: 0; border-top: 1px solid #ccc; margin: 16px 0; }
table {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0 14px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
}
th, td {
    border: 1px solid #cbd5e0;
    padding: 6px 9px;
    text-align: left;
    vertical-align: top;
}
th { background: #f4efe6; color: #1a3a5c; font-weight: 600; }
blockquote {
    border-left: 3px solid #c8924a;
    padding: 6px 12px;
    margin: 10px 0;
    background: #fafafa;
    color: #555;
}
code {
    background: #f4f4f4;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: Consolas, 'D2Coding', monospace;
    font-size: 9.5pt;
    color: #c44;
}
pre {
    background: #f4f4f4;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 10px 12px;
    font-family: Consolas, 'D2Coding', monospace;
    font-size: 9pt;
    line-height: 1.45;
    overflow-x: auto;
    page-break-inside: avoid;
}
pre code { background: transparent; color: #222; padding: 0; }
a { color: #2b6cb0; text-decoration: none; }
"""


def convert(md_path: Path, pdf_path: Path, chrome: str) -> bool:
    md_text = md_path.read_text(encoding="utf-8")
    html_body = markdown.markdown(
        md_text,
        extensions=["extra", "tables", "fenced_code", "sane_lists", "nl2br", "toc"],
        output_format="html5",
    )
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>{md_path.stem}</title>
<style>{CSS}</style>
</head>
<body>
{html_body}
</body>
</html>"""

    with tempfile.NamedTemporaryFile(
        "w", suffix=".html", delete=False, encoding="utf-8"
    ) as tf:
        tf.write(html)
        tmp_html = Path(tf.name)

    try:
        file_url = "file:///" + str(tmp_html.absolute()).replace("\\", "/")
        result = subprocess.run(
            [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--no-pdf-header-footer",
                "--print-to-pdf-no-header",
                f"--print-to-pdf={pdf_path.absolute()}",
                file_url,
            ],
            capture_output=True,
            timeout=120,
        )
    finally:
        try:
            tmp_html.unlink()
        except OSError:
            pass

    if pdf_path.exists() and pdf_path.stat().st_size > 0:
        size = pdf_path.stat().st_size
        try:
            print(f"[OK] {pdf_path} ({size:,} bytes)")
        except UnicodeEncodeError:
            print(f"[OK] {pdf_path.name} ({size:,} bytes)")
        return True

    print(f"[FAIL] {pdf_path.name}")
    try:
        print(result.stderr.decode("utf-8", errors="ignore")[:500])
    except Exception:
        pass
    return False


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("사용: python _convert_md_to_pdf.py <md파일경로> [pdf경로]")
        print("     python _convert_md_to_pdf.py <md1> <md2> ...")
        return 1

    chrome = find_chrome()

    # 단일 변환 + 출력 경로 지정 모드: `<md> <pdf>`
    if len(argv) == 3 and argv[2].lower().endswith(".pdf"):
        md_path = Path(argv[1]).resolve()
        pdf_path = Path(argv[2]).resolve()
        if not md_path.exists():
            print(f"[ERR] 파일 없음: {md_path}")
            return 1
        return 0 if convert(md_path, pdf_path, chrome) else 2

    # 다중 변환 모드: 각 md → 같은 폴더의 .pdf
    ok = True
    for raw in argv[1:]:
        md_path = Path(raw).resolve()
        if not md_path.exists():
            print(f"[ERR] 파일 없음: {md_path}")
            ok = False
            continue
        pdf_path = md_path.with_suffix(".pdf")
        if not convert(md_path, pdf_path, chrome):
            ok = False
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
