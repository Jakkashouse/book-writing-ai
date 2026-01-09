import re

# 파일 읽기
file_path = r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# "## 주제:" 뒤에 바로 한글이 오는 경우 줄바꿈 추가 (여러 차례 실행해도 안전)
content = re.sub(r'(## 주제: [^\n]{10,}) ([가-힣리A])', r'\1\n\n\2', content)

# 파일 저장
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("최종 정리 완료!")
print("- 주제와 본문 사이 줄바꿈 수정")
