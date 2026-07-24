"""Build PDF feedback report for 「나를 버리지 않은 것들 PART 6」"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# 한글 폰트 등록
pdfmetrics.registerFont(TTFont("Malgun", "C:/Windows/Fonts/malgun.ttf"))
pdfmetrics.registerFont(TTFont("MalgunBold", "C:/Windows/Fonts/malgunbd.ttf"))

# 색상
COLOR_PRIMARY = HexColor("#2D5016")
COLOR_ACCENT = HexColor("#8B6F47")
COLOR_WARN = HexColor("#B0413E")
COLOR_BG = HexColor("#FAF7F2")
COLOR_GRAY = HexColor("#6B6B6B")
COLOR_LIGHT = HexColor("#E8E2D5")

# 스타일
styles = getSampleStyleSheet()

style_title = ParagraphStyle(
    "Title", fontName="MalgunBold", fontSize=22, leading=30,
    textColor=COLOR_PRIMARY, alignment=TA_LEFT, spaceAfter=8,
)
style_subtitle = ParagraphStyle(
    "Subtitle", fontName="Malgun", fontSize=12, leading=18,
    textColor=COLOR_GRAY, alignment=TA_LEFT, spaceAfter=20,
)
style_h1 = ParagraphStyle(
    "H1", fontName="MalgunBold", fontSize=17, leading=24,
    textColor=COLOR_PRIMARY, spaceBefore=18, spaceAfter=10,
)
style_h2 = ParagraphStyle(
    "H2", fontName="MalgunBold", fontSize=13, leading=20,
    textColor=COLOR_ACCENT, spaceBefore=12, spaceAfter=6,
)
style_h3 = ParagraphStyle(
    "H3", fontName="MalgunBold", fontSize=11, leading=18,
    textColor=COLOR_WARN, spaceBefore=8, spaceAfter=4,
)
style_body = ParagraphStyle(
    "Body", fontName="Malgun", fontSize=10, leading=17,
    textColor=black, alignment=TA_JUSTIFY, spaceAfter=6,
)
style_quote = ParagraphStyle(
    "Quote", fontName="Malgun", fontSize=10, leading=16,
    textColor=COLOR_GRAY, alignment=TA_LEFT,
    leftIndent=15, rightIndent=15, spaceBefore=4, spaceAfter=4,
    borderColor=COLOR_LIGHT, borderWidth=0, borderPadding=8,
    backColor=COLOR_BG,
)
style_bullet = ParagraphStyle(
    "Bullet", fontName="Malgun", fontSize=10, leading=17,
    textColor=black, leftIndent=15, bulletIndent=5, spaceAfter=4,
)
style_caption = ParagraphStyle(
    "Caption", fontName="Malgun", fontSize=9, leading=14,
    textColor=COLOR_GRAY, alignment=TA_CENTER, spaceAfter=4,
)

# 문서 생성
out_path = "C:/Users/JUN/Downloads/나를버리지않은것들_PART6_피드백.pdf"
doc = SimpleDocTemplate(
    out_path, pagesize=A4,
    leftMargin=22*mm, rightMargin=22*mm,
    topMargin=20*mm, bottomMargin=20*mm,
    title="나를 버리지 않은 것들 PART 6 피드백",
    author="이선생",
)

story = []

def P(text, style=style_body):
    story.append(Paragraph(text, style))

def S(h=6):
    story.append(Spacer(1, h))

def hr():
    t = Table([[""]], colWidths=[166*mm], rowHeights=[0.5])
    t.setStyle(TableStyle([("LINEBELOW", (0,0), (-1,-1), 0.5, COLOR_LIGHT)]))
    story.append(t)
    S(10)

# ============== 표지 ==============
P("「나를 버리지 않은 것들」", style_title)
P("PART 6 — 100문 워크북 답변편<br/>출간 관점 종합 피드백", style_subtitle)

cover_data = [
    ["작가", "김서진"],
    ["검토자", "이선생"],
    ["검토일", "2026-05-13"],
    ["대상 분량", "100문 / 시드 풀챕터 15개 + 추정 초안 85개"],
    ["검토 목적", "짧은 책 출간 전 진단"],
]
cover_table = Table(cover_data, colWidths=[28*mm, 138*mm])
cover_table.setStyle(TableStyle([
    ("FONTNAME", (0,0), (-1,-1), "Malgun"),
    ("FONTSIZE", (0,0), (-1,-1), 10),
    ("TEXTCOLOR", (0,0), (0,-1), COLOR_ACCENT),
    ("FONTNAME", (0,0), (0,-1), "MalgunBold"),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ("TOPPADDING", (0,0), (-1,-1), 8),
    ("LINEBELOW", (0,0), (-1,-1), 0.3, COLOR_LIGHT),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
]))
story.append(cover_table)
S(30)

# 한 줄 결론
conclusion = Table(
    [[Paragraph(
        "<b>한 줄 결론</b><br/><br/>"
        "시드 15개는 강력합니다(평균 90점대). 추정 85개는 책의 평균을 떨어뜨립니다(60점대). "
        "100문을 다 채우려 하지 말고, <b>15~25문 답변집</b>으로 축소 출간을 추천합니다.",
        style_body
    )]],
    colWidths=[166*mm]
)
conclusion.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), COLOR_BG),
    ("BOX", (0,0), (-1,-1), 1, COLOR_PRIMARY),
    ("LEFTPADDING", (0,0), (-1,-1), 14),
    ("RIGHTPADDING", (0,0), (-1,-1), 14),
    ("TOPPADDING", (0,0), (-1,-1), 14),
    ("BOTTOMPADDING", (0,0), (-1,-1), 14),
]))
story.append(conclusion)

story.append(PageBreak())

# ============== 1. 종합 진단 ==============
P("1. 종합 진단 (100점 기준)", style_h1)
hr()

score_data = [
    ["항목", "점수", "평"],
    ["구조", "20 / 25", "100문 워크북 골격 분명. Part 분할 깔끔.\n다만 답 길이 편차가 심함"],
    ["문장", "23 / 25", "짧은 문단, ◇ 단락 구분, '-이다/-했다' 톤\n일관성 높음 — 가장 강한 축"],
    ["메시지", "17 / 25", "시드 15개는 강력. 추정 85개가 메시지 흐림.\n같은 결론 반복 (시설쌤 어록, '느리지만 정확')"],
    ["몰입도", "18 / 25", "시드 챕터 90점+, 추정 챕터 60점대.\n평균 78점 — 출간 직전 단계 아님"],
    ["총점", "78 / 100", "짧은 책 출간하려면 15~20점 보강 필요"],
]
score_table = Table(score_data, colWidths=[24*mm, 28*mm, 114*mm])
score_table.setStyle(TableStyle([
    ("FONTNAME", (0,0), (-1,0), "MalgunBold"),
    ("FONTNAME", (0,1), (-1,-1), "Malgun"),
    ("FONTSIZE", (0,0), (-1,-1), 10),
    ("BACKGROUND", (0,0), (-1,0), COLOR_PRIMARY),
    ("TEXTCOLOR", (0,0), (-1,0), white),
    ("BACKGROUND", (0,-1), (-1,-1), COLOR_LIGHT),
    ("FONTNAME", (0,-1), (-1,-1), "MalgunBold"),
    ("ALIGN", (1,0), (1,-1), "CENTER"),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING", (0,0), (-1,-1), 8),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ("LEFTPADDING", (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ("GRID", (0,0), (-1,-1), 0.3, COLOR_LIGHT),
]))
story.append(score_table)
S(20)

# ============== 2. 가장 시급한 문제 ==============
P("2. 가장 시급한 문제 — 추정 초안 85개의 진정성", style_h1)
hr()
P("작가님이 가장 걱정하시는 그 지점, 정확합니다. 읽으면서 표시한 위험 신호 구간:", style_body)
S()

# 2-1
P("2-1. 'AI가 메운 게 드러나는' 자리들", style_h2)

P("Q5 (어머니에게서 물려받은 것)", style_h3)
P("\"물려받았다고 말하려면 주는 사람과 받는 사람 사이에 어떤 시간이 있어야 하는데, 나에게는 그 시간이 없었다.\"", style_quote)
P("→ <b>너무 잘 정리된 부재의 철학.</b> 김서진 톤이 아니라 '글 잘 쓰는 사람의 톤'. "
  "시설 출신 30대 여성이 자기 부모에 대해 이렇게 매끄럽게 정리하지 못합니다. "
  "더 어둡거나, 더 침묵하거나, 더 단순해야 합니다.", style_body)
S()

P("Q6 (아버지)", style_h3)
P("\"없음도 어떤 모양을 갖는다. 그 모양이 나를 만들었다면, 그것도 물려받은 것이라고 부를 수 있겠지.\"", style_quote)
P("→ <b>에세이스트의 문장.</b> 김서진이 쓰기에는 너무 형이상학적.", style_body)
S()

P("Q44 (관계 교훈)", style_h3)
P("\"기대하지 말 것. 근데 기대 안 하는 척도 하지 말 것.\"", style_quote)
P("→ <b>격언체.</b> 김서진은 격언을 안 만드는 사람입니다. 시드 챕터를 보면 항상 장면(scene)으로 갑니다.", style_body)
S()

P("같은 문제 — Q76, Q80, Q92, Q93, Q97. '한 줄 잠언'으로 끝나는 답들이 너무 많습니다.", style_body)
S(12)

# 2-2
P("2-2. '시설쌤 한 마디' 의존증", style_h2)
P("추정 초안에서 <b>시설쌤 어록이 8회 이상</b> 등장합니다 (Q47, Q48, Q67, Q70, Q81, Q83, Q88, Q93). "
  "시드는 3개(Q9, Q47, Q48)인데 추정으로 5개를 더 만들어냈습니다.", style_body)
S()

warning_box = Table(
    [[Paragraph(
        "<b>⚠ 이게 가장 위험합니다.</b><br/><br/>"
        "한 권의 책에서 같은 인물(시설쌤)의 같은 어록('열심히 살아라/돈 모아라/밥 잘 챙겨먹고')이 "
        "반복되면, 독자는 '이 작가는 시설쌤 말고 다른 어른을 못 만났나' 또는 "
        "'AI가 같은 우물을 계속 파고 있다'고 느낍니다.",
        style_body
    )]],
    colWidths=[166*mm]
)
warning_box.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), HexColor("#FBEEEE")),
    ("BOX", (0,0), (-1,-1), 1, COLOR_WARN),
    ("LEFTPADDING", (0,0), (-1,-1), 12),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ("TOPPADDING", (0,0), (-1,-1), 12),
    ("BOTTOMPADDING", (0,0), (-1,-1), 12),
]))
story.append(warning_box)
S(12)

# 2-3
P("2-3. '느리지만 정확'의 과사용", style_h2)
P("Q46이 시드 풀챕터(요리하는 게 느리다)인데, 추정 초안 Q51, Q55, Q56, Q92에서 같은 메시지가 변주됩니다. "
  "<b>시드 1개가 추정 4개의 모티프가 됨.</b> "
  "이건 작가의 자기 정체성이 아니라 AI가 잡은 키워드의 반복입니다.", style_body)

story.append(PageBreak())

# ============== 3. 출간 전략 ==============
P("3. 출간 전략 — 두 가지 길", style_h1)
hr()

# 길 A
P("🟢 길 A: '15문 답변집'으로 축소 (강력 추천)", style_h2)
P("작가님이 실제로 답하신 15개만으로 한 권을 냅니다.", style_body)
S()
bullets_a = [
    "분량: 현재 15개 풀챕터로도 충분히 80~100쪽 (단행본 한 권)",
    "제목 예: 「나를 버리지 않은 것들 — 15개의 답」 또는 「열다섯 개의 자리」",
    "100문 워크북은 <b>부록으로 빈칸 인쇄</b> (독자가 직접 채우는 워크북 페이지)",
]
for b in bullets_a:
    P(f"• {b}", style_bullet)
S()
P("<b>장점:</b> 진정성 100%. AI 추정 0%. 책의 무게가 묵직해집니다.<br/>"
  "<b>단점:</b> '100문'이라는 콘셉트는 포기.", style_body)
S(12)

# 길 B
P("🟡 길 B: 추정 85개를 작가 시드로 추가 채집 (시간 필요)", style_h2)
P("지금 추정 초안은 다 폐기하고, 작가에게 <b>시드 추가 인터뷰</b> 진행:", style_body)
S()
bullets_b = [
    "빈 85개를 한 번에 채우려 하지 말고, <b>Part별 5~7개씩 추가 시드</b>만 받기",
    "100개 다 채울 필요 없음. <b>40~50개 풀챕터 + 나머지는 빈 페이지</b> 형식도 가능",
    "빈 페이지에 '이 질문은 작가가 아직 답하지 않았습니다. 당신이라면?' 한 줄",
]
for b in bullets_b:
    P(f"• {b}", style_bullet)
S()
P("<b>장점:</b> 100문 콘셉트 유지. 독자 참여형.<br/>"
  "<b>단점:</b> 작가 추가 작업 4~8시간 필요.", style_body)
S(20)

# ============== 4. 즉시 고쳐야 할 디테일 ==============
P("4. 즉시 고쳐야 할 디테일 (어느 길로 가든)", style_h1)
hr()
P("풀챕터 15개에서도 손볼 곳", style_h2)

P("Q9 (열심히 돈 모으자) — 마지막 줄", style_h3)
P("\"열심히 돈 모으자. 그 말이 지금도 내 통장에 살고 있다.\"", style_quote)
P("→ '통장에 살고 있다'는 <b>너무 잘 빠진 마무리.</b> 김서진은 이렇게 마무리 잘 하는 사람이 아닙니다. "
  "시드 챕터들 중 결말이 가장 '에세이스트적'인 챕터.", style_body)
P("<b>고침안:</b> \"지금도 한 푼씩 모은다. 그 말이 내 안에 있다.\"", style_body)
S()

P("Q48 (돈 모아라) — 시설쌤 카드 장면", style_h3)
P("\"그 옆에 시설쌤이 보낸 카드가 있었다. 짧은 카드였다. 근데 그 카드를 한참 들여다봤다.\"", style_quote)
P("→ <b>카드에 뭐가 쓰여 있었는지 안 나옵니다.</b> 그러다 갑자기 '쌤의 글씨를 다시 봤다. 돈 모아라.'가 나옵니다. "
  "카드 내용 = '돈 모아라' 한 줄인지가 모호. <b>작가 확인 필요.</b>", style_body)
S()

P("Q66 (면접/합격) — 가장 강한 챕터", style_h3)
P("이 챕터는 거의 손댈 데 없습니다. <b>이 톤이 책 전체의 기준점</b>이 되어야 합니다.", style_body)
S()

P("Q95 (나의 인생)", style_h3)
P("\"거창한 답을 못 적어 미안하다.\"", style_quote)
P("→ 시드 챕터 중 <b>유일하게 독자에게 사과하는 문장.</b> 김서진은 사과 안 하는 톤입니다. <b>삭제 권장.</b>", style_body)
S()

P("Q100 (생각하며 살자) — 마지막 결론", style_h3)
P("이 챕터는 <b>너무 깨끗하게 떨어지는 마무리.</b> "
  "'빠르게 살지 마세요. 가끔은 멈추세요' 같은 명령형 3연속은 자기계발서 어조입니다. "
  "김서진은 명령 안 합니다. 톤 조정 필요.", style_body)

story.append(PageBreak())

# ============== 5. 책 형태 제안 ==============
P("5. 책 형태 제안", style_h1)
hr()

P("제목 후보", style_h2)
P("현재 「나를 버리지 않은 것들」 — 너무 무겁습니다. 100문 답변집의 톤과 안 맞음.", style_body)
S()
title_options = [
    "「열다섯 개의 자리」",
    "「식탁, 동대문, 그리고 도마」 (세 풀챕터의 핵심 장소)",
    "「열심히 살아라 — 김서진의 100문」",
]
for t in title_options:
    P(f"• {t}", style_bullet)
S(12)

P("판형 & 분량", style_h2)
spec_data = [
    ["판형", "신국판 변형(128×188) 또는 사륙판(127×188)"],
    ["분량", "길 A = 96쪽 / 길 B = 160~200쪽"],
    ["디자인 포인트", "'◇' 구분자가 이미 책 디자인 요소. 살리세요."],
]
spec_table = Table(spec_data, colWidths=[35*mm, 131*mm])
spec_table.setStyle(TableStyle([
    ("FONTNAME", (0,0), (-1,-1), "Malgun"),
    ("FONTNAME", (0,0), (0,-1), "MalgunBold"),
    ("FONTSIZE", (0,0), (-1,-1), 10),
    ("TEXTCOLOR", (0,0), (0,-1), COLOR_ACCENT),
    ("TOPPADDING", (0,0), (-1,-1), 8),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ("LEFTPADDING", (0,0), (-1,-1), 10),
    ("LINEBELOW", (0,0), (-1,-1), 0.3, COLOR_LIGHT),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
]))
story.append(spec_table)
S(20)

# ============== 6. 다음 액션 ==============
P("6. 다음 액션 추천", style_h1)
hr()

recommend_box = Table(
    [[Paragraph(
        "<b>제 추천:</b><br/>"
        "길 A (15문 답변집) + 작가 추가 시드 10개 = <b>25문 답변집</b>",
        style_body
    )]],
    colWidths=[166*mm]
)
recommend_box.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), COLOR_BG),
    ("BOX", (0,0), (-1,-1), 1.5, COLOR_PRIMARY),
    ("LEFTPADDING", (0,0), (-1,-1), 14),
    ("RIGHTPADDING", (0,0), (-1,-1), 14),
    ("TOPPADDING", (0,0), (-1,-1), 14),
    ("BOTTOMPADDING", (0,0), (-1,-1), 14),
]))
story.append(recommend_box)
S(12)

P("이유", style_h2)
reasons = [
    "작가의 진짜 목소리가 들어간 15개는 매우 강력합니다 (Q66, Q17, Q18은 90점대)",
    "AI 추정 85개는 <b>책의 평균 점수를 떨어뜨립니다</b> (작가 톤이 흔들림)",
    "25문이면 한 권 분량 충분 (각 챕터 평균 1,500자 × 25 = 37,500자, 약 130쪽)",
    "시드 10개 추가 채집은 1~2시간 인터뷰면 가능",
]
for i, r in enumerate(reasons, 1):
    P(f"{i}. {r}", style_bullet)
S(16)

P("작가가 어디서 막혔는지", style_h2)
P("Part 3 (사랑/관계)와 Part 6 후반의 <b>추상적 질문</b>에서 답을 안 주셨습니다. "
  "거기서 작가가 답하기 쉬운 <b>각도로 질문을 다시 잡아야</b> 합니다. "
  "예: 'Q44 관계에서 배운 교훈' → '관계 때문에 가장 오래 잠 못 잤던 밤'", style_body)
S(20)

# 마무리
final_box = Table(
    [[Paragraph(
        "<b>다음 단계 제안</b><br/><br/>"
        "길 A로 가신다면, <b>25문 시드 추가 인터뷰 질문지</b>를 만들어드리겠습니다.<br/>"
        "Part 3과 Part 6 후반의 추상 질문 10개를 작가가 답하기 쉬운 장면 질문으로 다시 잡습니다.",
        style_body
    )]],
    colWidths=[166*mm]
)
final_box.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), HexColor("#F0F4E8")),
    ("BOX", (0,0), (-1,-1), 0.5, COLOR_PRIMARY),
    ("LEFTPADDING", (0,0), (-1,-1), 14),
    ("RIGHTPADDING", (0,0), (-1,-1), 14),
    ("TOPPADDING", (0,0), (-1,-1), 14),
    ("BOTTOMPADDING", (0,0), (-1,-1), 14),
]))
story.append(final_box)

S(30)
P("— 이선생 / 2026-05-13", style_caption)

# 빌드
doc.build(story)
print(f"OK: {out_path}")
print(f"Size: {os.path.getsize(out_path):,} bytes")
