import re

# 파일 읽기
with open(r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 주제 : XXX 뒤에 내용이 붙어있는 경우 줄바꿈 추가
# 주제 라인 뒤에 한글이나 영문이 바로 이어지는 경우를 찾아서 줄바꿈 추가
def fix_topic_line(match):
    topic_part = match.group(1)  # 주제 부분
    content_part = match.group(2)  # 뒤에 붙은 내용
    return f'주제 : {topic_part}\n\n{content_part}'

# 패턴: "주제 : XXX" 뒤에 바로 한글/영문/숫자가 오는 경우
content = re.sub(r'주제 : (.+?)\s+([가-힣a-zA-Z0-9\[])', fix_topic_line, content)

# 파일 저장
with open(r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("주제 라인 정리 완료!")
