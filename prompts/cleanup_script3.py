import re

# 파일 읽기
file_path = r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. "## 주제: XXX 본문" -> "## 주제: XXX\n\n본문" (줄바꿈 추가)
content = re.sub(r'(## 주제: [^\n]+) ([가-힣리])', r'\1\n\n\2', content)

# 2. 영화 정보가 여러 줄로 나뉜 경우 수정
# "1. 제목 감독: XXX\n\n주연 : XXX" -> "1. 제목 (감독: XXX, 주연: XXX)"
content = re.sub(r'(\d+)\. ([^\n]+?) 감독: ([^\n]+?)\n\n주연 : ([^\n]+)', r'\1. \2 (감독: \3, 주연: \4)', content)

# 3. "2. 아바타(2009) (제임스..." 같은 형식 수정
content = re.sub(r'(\d+)\. ([^\(]+)\((\d{4})\) \(([^,]+), 주연: ([^\)]+)\)', r'\1. \2 (\3, 감독: \4, 주연: \5)', content)

# 4. "3. 월 스트리트(1987) 감독:" 형식 수정
content = re.sub(r'(\d+)\. ([^\(]+)\((\d{4})\) 감독: ([^\n]+?)\n\n주연 : ([^\n]+)', r'\1. \2 (\3, 감독: \4, 주연: \5)', content)

# 5. 콜론 뒤 띄어쓰기 통일 (주연 : -> 주연:)
content = re.sub(r'주연 : ', '주연: ', content)
content = re.sub(r'감독 : ', '감독: ', content)
content = re.sub(r'출연 : ', '출연: ', content)

# 파일 저장
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("최종 정리 완료!")
print("- 주제와 본문 사이 줄바꿈 추가")
print("- 영화 제목 형식 통일")
print("- 콜론 뒤 띄어쓰기 통일")
