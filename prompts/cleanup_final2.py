import re

# 파일 읽기
file_path = r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 주제 헤더와 본문 분리
result = []
i = 0
while i < len(lines):
    line = lines[i]

    # ## 주제: 로 시작하는 줄 찾기
    if line.startswith('## 주제:'):
        # 주제 줄 추가
        result.append(line.rstrip() + '\n')
        # 빈 줄 추가 (이미 있으면 추가하지 않음)
        if i + 1 < len(lines) and lines[i + 1].strip():
            result.append('\n')
        i += 1
    else:
        result.append(line)
        i += 1

# 파일 저장
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(result)

print("최종 정리 완료!")
print("- 주제 헤더 정리")
