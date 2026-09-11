"""
render.py — HTML 템플릿에 변수 주입 후 PDF·PNG 변환

사용:
    # 카드뉴스 (10장 PDF + 10장 PNG)
    python automation/design/render.py \
        --template cardnews \
        --vars Downloads/marketing/2026-05-18-XYZ/cardnews_vars.json \
        --out Downloads/marketing/2026-05-18-XYZ/cardnews

    # 표지 시안
    python automation/design/render.py \
        --template cover \
        --vars Downloads/covers/XYZ/vars.json \
        --out Downloads/covers/XYZ/cover_a

의존성: jinja2, weasyprint
설치: pip install jinja2 weasyprint
Windows weasyprint: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from jinja2 import Template

TEMPLATE_DIR = Path(__file__).parent
TEMPLATES = {
    "cardnews": TEMPLATE_DIR / "cardnews_template.html",
    "cover": TEMPLATE_DIR / "cover_template.html",
}


def render_html(template_name: str, vars_path: Path) -> str:
    tpl_path = TEMPLATES[template_name]
    src = tpl_path.read_text(encoding="utf-8")
    src = src.replace("{{", "((").replace("}}", "))")
    src = src.replace("((", "{{ ").replace("))", " }}")
    template = Template(src)
    data = json.loads(vars_path.read_text(encoding="utf-8"))
    return template.render(**data)


def to_pdf(html: str, out_pdf: Path) -> None:
    from weasyprint import HTML
    out_pdf.parent.mkdir(parents=True, exist_ok=True)
    HTML(string=html).write_pdf(str(out_pdf))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", required=True, choices=list(TEMPLATES.keys()))
    parser.add_argument("--vars", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path, help="확장자 제외 경로")
    args = parser.parse_args()

    html = render_html(args.template, args.vars)

    html_out = args.out.with_suffix(".html")
    html_out.parent.mkdir(parents=True, exist_ok=True)
    html_out.write_text(html, encoding="utf-8")
    print(f"HTML: {html_out}")

    pdf_out = args.out.with_suffix(".pdf")
    to_pdf(html, pdf_out)
    print(f"PDF:  {pdf_out}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
