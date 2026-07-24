"""작가님께 드리는 쉬운 피드백 — 「나를 버리지 않은 것들 PART 6」"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

pdfmetrics.registerFont(TTFont("Malgun", "C:/Windows/Fonts/malgun.ttf"))
pdfmetrics.registerFont(TTFont("MalgunBold", "C:/Windows/Fonts/malgunbd.ttf"))

# 따뜻한 톤 색
COLOR_INK = HexColor("#3A2E1F")
COLOR_WARM = HexColor("#8B6F47")
COLOR_SOFT = HexColor("#C9A876")
COLOR_BG = HexColor("#FAF5EC")
COLOR_LINE = HexColor("#E5D9C0")
COLOR_GRAY = HexColor("#7A6F60")

style_title = ParagraphStyle(
    "Title", fontName="MalgunBold", fontSize=20, leading=30,
    textColor=COLOR_INK, alignment=TA_LEFT, spaceAfter=6,
)
style_sub = ParagraphStyle(
    "Sub", fontName="Malgun", fontSize=11, leading=18,
    textColor=COLOR_GRAY, alignment=TA_LEFT, spaceAfter=18,
)
style_letter = ParagraphStyle(
    "Letter", fontName="Malgun", fontSize=11, leading=20,
    textColor=COLOR_INK, alignment=TA_LEFT, spaceAfter=10,
    firstLineIndent=0,
)
style_h = ParagraphStyle(
    "H", fontName="MalgunBold", fontSize=14, leading=22,
    textColor=COLOR_WARM, spaceBefore=14, spaceAfter=10,
)
style_quote = ParagraphStyle(
    "Quote", fontName="Malgun", fontSize=10, leading=17,
    textColor=COLOR_GRAY, alignment=TA_LEFT,
    leftIndent=18, rightIndent=18, spaceBefore=6, spaceAfter=6,
)
style_caption = ParagraphStyle(
    "Caption", fontName="Malgun", fontSize=10, leading=16,
    textColor=COLOR_GRAY, alignment=TA_CENTER, spaceAfter=4,
)

out_path = "C:/Users/JUN/Downloads/김서진작가님께_PART6_쉬운피드백.pdf"
doc = SimpleDocTemplate(
    out_path, pagesize=A4,
    leftMargin=24*mm, rightMargin=24*mm,
    topMargin=24*mm, bottomMargin=22*mm,
    title="김서진 작가님께 — 쉬운 피드백",
)

story = []

def P(text, s=style_letter):
    story.append(Paragraph(text, s))

def S(h=6):
    story.append(Spacer(1, h))

def box(text, color=COLOR_BG, border=COLOR_SOFT):
    t = Table([[Paragraph(text, style_letter)]], colWidths=[160*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), color),
        ("BOX", (0,0), (-1,-1), 0.8, border),
        ("LEFTPADDING", (0,0), (-1,-1), 16),
        ("RIGHTPADDING", (0,0), (-1,-1), 16),
        ("TOPPADDING", (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
    ]))
    story.append(t)

# ============ 표지 ============
P("김서진 작가님께", style_title)
P("「나를 버리지 않은 것들」 PART 6을 읽고 — 이선생 드림", style_sub)

S(20)
box(
    "<b>먼저 한 마디</b><br/><br/>"
    "작가님이 직접 답해주신 15개를 읽으면서, 저는 몇 번이고 멈췄습니다.<br/>"
    "특히 <b>이빨 빠진 날</b>과 <b>면접 보러 가던 그 길</b>은, 다른 누구도 쓸 수 없는 글이었습니다.<br/><br/>"
    "이 책, 충분히 한 권으로 나올 수 있습니다.<br/>"
    "다만 <b>지금 그대로</b>가 아니라, <b>조금 다르게</b>요. 그 이야기를 편지처럼 적어볼게요."
)

story.append(PageBreak())

# ============ 1. 좋았던 것 ============
P("작가님 글에서 가장 좋았던 것", style_h)

P("작가님 글에는 한 가지 큰 힘이 있어요. <b>장면을 보여주신다</b>는 거예요.", style_letter)
S()
P("부모님이 안 계셨다고 <b>설명하지 않고</b>, 시설쌤 식탁에서 고기 먹다 이빨 빠진 그 장면을 보여주셨어요. "
  "외로웠다고 <b>말하지 않고</b>, 동대문 밤거리에 혼자 서 있던 그 모습을 보여주셨어요.", style_letter)
S()
P("이게 진짜 글이에요. 좋은 글은 설명하지 않고 보여줍니다. 작가님은 이미 그걸 하고 계세요.", style_letter)

S(14)
box(
    "<b>특히 잘 쓰신 세 꼭지</b><br/><br/>"
    "<b>Q1.</b> 시설쌤 집에서 이빨 빠진 날 — 시작이 이렇게 좋을 수가 없어요<br/>"
    "<b>Q17.</b> 동대문 — '아무도 나를 모르는 곳이 좋았다'는 한 줄로 어린 날이 다 들어옵니다<br/>"
    "<b>Q66.</b> 면접 보고 합격하던 날 — '기쁨이 30초 가다가 바로 학비 걱정으로 넘어갔다'는 문장, "
    "이 한 줄에 작가님의 인생이 다 있어요",
    color=HexColor("#F4EEE1")
)

story.append(PageBreak())

# ============ 2. 솔직히 말씀드릴 것 ============
P("그런데 솔직히 말씀드릴 게 있어요", style_h)

P("작가님은 100문 중에 <b>15개</b>에 답을 주셨어요. "
  "나머지 85개는 제가 작가님 톤을 흉내내서 채워봤어요.", style_letter)
S()
P("그런데 다시 읽어보니, <b>제가 채운 85개가 작가님 글을 흐리고 있어요.</b>", style_letter)
S()

P("왜냐하면요,", style_letter)
S(4)

P("작가님이 직접 쓰신 글은 항상 <b>장면</b>이에요. 식탁, 거리, 도마, 통장.<br/>"
  "제가 채운 글은 자꾸 <b>교훈</b>이 돼요. '시간은 시련도 풀어준다', '받은 만큼만 줘도 사랑이다'.", style_letter)
S()

P("이런 문장들은 듣기엔 그럴듯한데, <b>작가님 목소리가 아니에요.</b> "
  "이건 책에서 흔히 보는 어른 목소리예요. 작가님 글의 힘은 그게 아니에요.", style_letter)

S(12)

box(
    "<b>비유로 말씀드리면요</b><br/><br/>"
    "작가님이 도마 위에 직접 올린 재료가 <b>15개</b>가 있어요. 신선하고 색이 살아 있어요.<br/>"
    "그 옆에 제가 시장에서 사다 놓은 재료가 <b>85개</b>가 있어요. 모양은 비슷한데 향이 다르거든요.<br/><br/>"
    "두 가지를 같은 접시에 담으면, 신선한 15개의 향까지 흐려져요.<br/>"
    "<b>그래서 제가 사 온 85개는 일단 빼자</b>는 게 제 첫 번째 부탁이에요.",
    color=HexColor("#FCF5E8"), border=COLOR_SOFT
)

story.append(PageBreak())

# ============ 3. 그래서 어떻게? ============
P("그럼 어떻게 하면 좋을까요?", style_h)

P("두 가지 길이 있어요. 작가님이 골라주시면 돼요.", style_letter)
S(10)

# 길 1
P("<b>첫 번째 길 — 작은 책, 진짜 책</b>", style_letter)
S(4)
P("작가님이 답해주신 <b>15개만으로</b> 한 권을 냅니다.", style_letter)
P("• 분량은 약 100쪽 정도 됩니다. 얇지만 묵직한 책이에요.<br/>"
  "• 제목은 「<b>열다섯 개의 자리</b>」 같은 게 어울려요. 작아서 다정한 느낌.<br/>"
  "• 뒷부분에 100문 워크북을 <b>빈칸으로</b> 넣어드려요. 독자가 직접 적게요.", style_letter)
S(6)
P("이 길의 좋은 점: 책 전체가 작가님 목소리예요. 한 줄도 흐리지 않아요.<br/>"
  "이 길의 아쉬운 점: '100문 답변집'이라는 이름은 못 써요.", style_letter)

S(14)

# 길 2
P("<b>두 번째 길 — 25개로 늘려서 내는 책</b>", style_letter)
S(4)
P("작가님이 답해주신 15개에 + <b>10개만 더</b> 답해주시는 거예요.", style_letter)
P("• 100개 다 채우지 않아도 돼요. 25개면 책 한 권 분량 충분해요.<br/>"
  "• 제가 질문 10개를 <b>답하기 쉽게</b> 다시 만들어드릴게요.<br/>"
  "• 예를 들어 '사랑에 대해 알게 된 것?' 이런 어려운 질문 말고요,<br/>"
  "   '누군가 때문에 잠 못 잤던 밤이 있다면?' 이렇게요. 장면으로요.", style_letter)
S(6)
P("이 길의 좋은 점: 더 두꺼운 책이 나옵니다.<br/>"
  "이 길의 아쉬운 점: 작가님이 한두 시간 더 인터뷰에 응해주셔야 해요.", style_letter)

S(16)

box(
    "<b>제 생각</b><br/><br/>"
    "어느 쪽이든 좋습니다.<br/>"
    "다만 <b>지금 100개 그대로 내는 건 권하지 않아요.</b><br/><br/>"
    "왜냐하면 제가 채운 85개는, 시간이 지나서 책을 다시 읽으셨을 때<br/>"
    "'어, 이건 내가 안 쓴 것 같은데'라는 느낌이 드실 거예요.<br/>"
    "그게 작가님께도, 독자에게도 좋지 않아요.",
    color=HexColor("#F4EEE1")
)

story.append(PageBreak())

# ============ 4. 작은 손볼 것들 ============
P("작가님이 쓰신 15개에서도, 아주 작게 손볼 곳이 있어요", style_h)

P("거의 다 좋아요. 정말 살짝만요.", style_letter)
S(8)

# Q9
P("<b>Q9. 열심히 돈 모으자 — 마지막 문장</b>", style_letter)
P("\"그 말이 지금도 내 통장에 살고 있다.\"", style_quote)
P("→ 이 문장이 너무 예뻐서, <b>오히려 작가님답지 않아요.</b> "
  "작가님은 평소에 예쁘게 말 안 하시잖아요. 더 무뚝뚝하게 가도 좋겠어요.", style_letter)
P("예: \"지금도 한 푼씩 모은다.\" — 이 정도로요.", style_letter)
S(10)

# Q48
P("<b>Q48. 첫 출근 날 — 시설쌤이 보낸 카드</b>", style_letter)
P("'카드에 무엇이 쓰여 있었는지'가 글에 안 나와요. "
  "그러다 갑자기 '돈 모아라'가 나옵니다. <b>카드에 그 한 줄이 쓰여 있었던 거 맞나요?</b> "
  "알려주시면 글을 매끄럽게 다듬을게요.", style_letter)
S(10)

# Q95
P("<b>Q95. 나의 인생 — 한 줄만 빼주세요</b>", style_letter)
P("\"거창한 답을 못 적어 미안하다.\"", style_quote)
P("→ 작가님은 미안하다고 사과하실 일 없어요. 이 한 줄만 빼면 훨씬 단단해져요.", style_letter)
S(10)

# Q100
P("<b>Q100. 마지막 결론 — 명령형이 좀 많아요</b>", style_letter)
P("\"빠르게 살지 마세요. 가끔은 멈추세요. 멈춰서 생각하세요.\"", style_quote)
P("→ 이 부분이 약간 <b>자기계발서 톤</b>이에요. 작가님은 평소에 누구한테 '하세요' 안 하시잖아요. "
  "이 부분만 살짝 톤을 낮추면 좋겠어요.", style_letter)

story.append(PageBreak())

# ============ 5. 마지막 ============
P("마지막으로", style_h)

P("작가님,", style_letter)
S(4)
P("이 글을 읽으시면서 혹시 <b>'내가 부족하구나'</b> 하는 마음이 드셨다면, "
  "그건 제가 글을 잘못 쓴 거예요.", style_letter)
S()
P("저는 작가님 글이 부족하다고 말씀드리는 게 아니에요.<br/>"
  "<b>작가님 글이 너무 좋아서, 제가 채운 부분이 그걸 못 따라간다</b>고 말씀드리는 거예요.", style_letter)
S()
P("작가님이 답해주신 15개는 그 자체로 한 권의 책이 됩니다.<br/>"
  "거기에 10개만 더 보태주시면, 더 든든한 한 권이 됩니다.", style_letter)
S()
P("어느 쪽이든, <b>작가님이 직접 말씀하신 것만</b>으로 책을 만들고 싶어요.<br/>"
  "그게 작가님께도, 독자에게도 가장 정직한 책이 될 거예요.", style_letter)

S(16)

box(
    "<b>다음에 어떻게 할까요?</b><br/><br/>"
    "<b>1.</b> 작가님이 '15개로 작게 갈게요' 하시면 — 제가 그 15개를 살짝 다듬어서 책 형태로 만들어드릴게요.<br/><br/>"
    "<b>2.</b> 작가님이 '10개 더 답해볼게요' 하시면 — 제가 답하기 쉬운 질문 10개를 준비해서 보내드릴게요.<br/><br/>"
    "<b>3.</b> 그것도 결정하기 어려우시면 — 작가님이 답해주신 15개를 먼저 한 권 모양으로 만들어서 보여드릴게요. "
    "직접 보시고 결정하시면 돼요.",
    color=HexColor("#F4EEE1")
)

S(30)
P("작가님의 이야기를 읽게 해주셔서 감사합니다.<br/>"
  "— 이선생 드림", style_caption)

doc.build(story)
print(f"OK: {out_path}")
print(f"Size: {os.path.getsize(out_path):,} bytes")
