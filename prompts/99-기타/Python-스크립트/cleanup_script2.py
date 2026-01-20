import re

# 파일 읽기
file_path = r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. "그말씀 X월호" 형태의 모든 텍스트 삭제 (더 강력한 패턴)
content = re.sub(r'그말씀\s+\d+월호\s*\n*', '', content)

# 2. 영화 제목 형식 통일: 여러 줄로 나뉜 것을 한 줄로
# "1. 영화제목\n\n감독 : XXX\n\n주연 : XXX" 형태를 "1. 영화제목 (감독: XXX, 주연: XXX)" 형태로
# 먼저 패턴 찾기
def unify_movie_format(text):
    # 패턴: 번호. 제목\n\n감독 : ...\n\n주연 : ...
    pattern = r'(\d+)\.\s+([^\n]+?)\s*\n\n감독\s*:\s*([^\n]+?)\s*\n\n주연\s*:\s*([^\n]+)'
    replacement = r'\1. \2 (\3, 주연: \4)'
    text = re.sub(pattern, replacement, text)

    # 패턴: 번호. 제목(연도)\n\n감독 : ...\n\n주연 : ...
    pattern = r'(\d+)\.\s+([^\n]+?)\s*\((\d{4})\)\s*\n\n감독\s*:\s*([^\n]+?)\s*\n\n주연\s*:\s*([^\n]+)'
    replacement = r'\1. \2 (\3, 감독: \4, 주연: \5)'
    text = re.sub(pattern, replacement, text)

    return text

content = unify_movie_format(content)

# 3. "감독 :"을 "감독:"으로 통일
content = re.sub(r'감독\s*:\s*', '감독: ', content)

# 4. 주제 줄과 본문이 붙어있는 경우 수정
# "## 주제: XXX 본문..." -> "## 주제: XXX\n\n본문..."
content = re.sub(r'(## 주제: [^\n]+)\s+([가-힣])', r'\1\n\n\2', content)

# 5. 불필요한 연속된 빈 줄 제거 (3개 이상의 연속 빈 줄을 2개로)
content = re.sub(r'\n\n\n+', '\n\n', content)

# 파일 저장
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("추가 정리 완료!")
print("- 남은 '그말씀 X월호' 텍스트 삭제")
print("- 영화 제목 형식 통일")
print("- 주제와 본문 사이 간격 조정")
