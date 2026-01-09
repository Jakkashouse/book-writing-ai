import re

# 파일 읽기
with open(r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

result = []
i = 0
while i < len(lines):
    line = lines[i]

    # "주제 :" 로 시작하는 줄을 찾음
    if line.strip().startswith('주제 :'):
        # 현재 주제 라인
        topic_line = line.strip()

        # 다음 줄이 비어있지 않고 내용이 있으면 주제에 붙여야 하는지 확인
        if i + 1 < len(lines):
            next_line = lines[i + 1].strip()

            # 다음 줄이 공백이 아니고, 계명 내용이나 주제 설명으로 보이면 합침
            # "너는", "네", "여호와", 등으로 시작하는 경우 주제의 일부로 간주
            if next_line and not next_line.startswith('#'):
                # 십계명 관련 패턴 체크
                commandment_patterns = [
                    r'^너는',
                    r'^네',
                    r'^여호와',
                    r'^안식일',
                    r'^살인',
                    r'^간음',
                    r'^도둑질',
                    r'^거짓'
                ]

                is_commandment_continuation = any(re.match(pattern, next_line) for pattern in commandment_patterns)

                if is_commandment_continuation:
                    # 주제 라인에 다음 줄 내용을 붙임
                    # 문장이 끝나는 부분까지만 가져옴 (마침표, 느낌표, 물음표까지)
                    sentence_end = re.search(r'[.!?]\s', next_line)
                    if sentence_end:
                        commandment_text = next_line[:sentence_end.end()].strip()
                        remaining_text = next_line[sentence_end.end():].strip()

                        result.append(f'{topic_line} {commandment_text}\n')
                        result.append('\n')
                        if remaining_text:
                            result.append(f'{remaining_text}\n')
                        i += 2  # 다음 줄을 처리했으므로 2칸 건너뜀
                        continue
                    else:
                        # 문장이 완결되지 않은 경우 전체를 가져옴
                        result.append(f'{topic_line} {next_line}\n')
                        i += 2
                        continue

        result.append(line)
        i += 1
    else:
        result.append(line)
        i += 1

# 파일 저장
with open(r'c:\Users\JUN\my-first-project\book-writing-ai\prompts\김양현 목사님 원고_재구성.md', 'w', encoding='utf-8') as f:
    f.writelines(result)

print("주제와 계명 내용 병합 완료!")
