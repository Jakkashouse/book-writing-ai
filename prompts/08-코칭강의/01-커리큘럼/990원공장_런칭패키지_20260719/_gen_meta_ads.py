# -*- coding: utf-8 -*-
"""990 챌린지 메타광고 이미지 일괄 생성.

공용 엔진(_overlay_ad.py)을 수정하지 않고 KICKER/CTA만 갈아끼워 재사용한다.
실행: python _gen_meta_ads.py
출력: ./광고이미지/  (1x1 · 4x5 · 9x16)
"""
import os
import sys
import importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "광고이미지")

spec = importlib.util.spec_from_file_location("ov", os.path.join(ROOT, "_overlay_ad.py"))
ov = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ov)

KICKER = "작가의집 · 3일 책쓰기 챌린지"
CTA = "1,000원으로 신청 →"
SUB = "종이책 무료 배송 · 7월 30일 라이브"

# (코드, 그라디언트, 헤드라인)  '|'=줄바꿈, '[..]'=강조색
CREATIVES = [
    ("A1_자격", "grad01", "10년 경력이|머릿속에만|있진 않나요"),
    ("A2_속도", "grad02", "3년째 미룬 책,|순서만 알면|[하루]면 기획이"),
    ("A3_명함", "grad03", "책 한 권이|새 [명함]이|됩니다"),
    ("A4_오퍼", "grad01", "종이책 한 권,|집으로|보내드립니다"),
]

SIZES = [("1x1", "1080x1080"), ("4x5", "1080x1350"), ("9x16", "1080x1920")]


def main():
    os.makedirs(OUT, exist_ok=True)
    ov.KICKER = KICKER
    ov.CTA = CTA

    made = 0
    for code, grad, head in CREATIVES:
        for label, size in SIZES:
            path = os.path.join(OUT, f"{code}_{label}.png")
            sys.argv = ["_overlay_ad.py", grad, head, SUB, path, size]
            ov.main()
            made += 1
    print(f"\n총 {made}장 생성 → {OUT}")


if __name__ == "__main__":
    main()
