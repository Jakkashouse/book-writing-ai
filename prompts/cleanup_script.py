import re

# 파일 읽기
file_path = r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. "그말씀 X월호" 형태의 모든 텍스트 삭제
content = re.sub(r'그말씀 \d+월호\n*', '', content)

# 2. "집필자 : 김양현 01085545192 fisherkim30@gmail.com" 형태의 모든 텍스트 삭제
content = re.sub(r'집필자\s*:\s*김양현\s+\d+\s+fisherkim30@gmail\.com\n*', '', content)

# 3. "주제 : XXX" 형태를 "## 주제: XXX" 형태로 변경
content = re.sub(r'주제\s*:\s*', '## 주제: ', content)

# 4. 띄어쓰기 정리
# 콜론(:) 뒤 띄어쓰기 정리 (이미 "주제:" 형태로 바뀌었으므로 다른 콜론들 처리)
content = re.sub(r':\s+', ': ', content)
# 쉼표(,) 뒤 띄어쓰기 정리
content = re.sub(r',\s+', ', ', content)

# 5. 번호 체계 일관되게 정리 (예: "50.   매드 맥스" → "50. 매드 맥스")
# 숫자 뒤 점(.)과 공백이 여러 개인 경우 하나로 통일
content = re.sub(r'(\d+)\.\s+', r'\1. ', content)

# 6. 불필요한 연속된 빈 줄 제거 (3개 이상의 연속 빈 줄을 2개로)
content = re.sub(r'\n\n\n+', '\n\n', content)

# 파일 저장
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("파일 정리 완료!")
print("- '그말씀 X월호' 텍스트 삭제")
print("- 집필자 정보 삭제")
print("- '주제:' 형태를 '## 주제:' 형태로 변경")
print("- 띄어쓰기 정리 (콜론, 쉼표 뒤)")
print("- 번호 체계 정리")
print("- 과도한 공백 제거")
