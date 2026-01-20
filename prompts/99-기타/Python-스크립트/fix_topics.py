import re

# 파일 읽기
with open(r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md', 'r', encoding='utf-8') as f:
    content = f.read()

# ## 주제: XXX 형식을 주제 : XXX 형식으로 변경
# 주제 뒤에 바로 내용이 오는 경우를 처리하기 위해 정교한 패턴 사용
def replace_topic(match):
    topic_text = match.group(1).strip()
    return f'주제 : {topic_text}'

# 패턴: ## 주제: 로 시작하고 그 뒤에 오는 텍스트
content = re.sub(r'^## 주제:\s*(.+?)(?=\n|$)', replace_topic, content, flags=re.MULTILINE)

# 파일 저장
with open(r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("주제 형식 변경 완료!")
