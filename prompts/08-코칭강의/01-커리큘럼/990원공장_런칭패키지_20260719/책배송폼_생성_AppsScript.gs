/**
 * 7/30 라이브 완주자 · 책 세트 배송 신청 폼 생성기
 * 작성 2026-07-22
 *
 * ─────────────────────────────────────────────
 * 사용법 (2분)
 * ─────────────────────────────────────────────
 * 1. script.google.com → 새 프로젝트 (설문 수집기와 별개 프로젝트로 만드세요)
 * 2. 이 내용 전체 붙여넣기
 * 3. 함수 목록에서 createForm 선택 → ▶ 실행 → 권한 승인
 * 4. 실행 로그에 두 개의 URL이 찍힙니다
 *      · 응답 폼 URL   → 7/30 라이브 채팅에 올릴 주소
 *      · 응답 시트 URL → 주소가 쌓이는 곳
 *
 * ⚠ 이 스크립트는 폼을 "만들기만" 합니다. 배포(웹앱) 필요 없습니다.
 *    한 번 실행하면 끝이고, 다시 실행하면 폼이 하나 더 생기니 주의하세요.
 * ─────────────────────────────────────────────
 */

var FORM_TITLE = '7/30 라이브 참석 감사 · 책 세트 신청';
var NOTIFY_EMAIL = 'joyfuljun4@gmail.com';


function createForm() {
  var form = FormApp.create(FORM_TITLE);

  form.setDescription(
    '오늘 두 시간 끝까지 함께해 주셔서 고맙습니다.\n' +
    '약속드린 대로, 제가 만든 책 열세 권을 세트로 보내드립니다.\n\n' +
    '· 상담 신청과는 아무 상관 없습니다. 끝까지 계셨던 분 전부 드립니다.\n' +
    '· 배송비도 저희가 부담합니다.\n' +
    '· 순차 발송이라 일주일 정도 걸릴 수 있습니다.\n\n' +
    '— 작가의집 황준연'
  );

  // 1. 성함
  form.addTextItem()
    .setTitle('성함')
    .setRequired(true);

  // 2. 연락처
  form.addTextItem()
    .setTitle('연락처')
    .setHelpText('배송 안내를 문자로 보내드립니다. 예: 010-1234-5678')
    .setRequired(true);

  // 3. 주소
  form.addParagraphTextItem()
    .setTitle('받으실 주소')
    .setHelpText('우편번호와 상세주소(동·호수)까지 적어주세요.')
    .setRequired(true);

  // 4. 완주 확인 겸 후기 — 실제로 들으신 분만 답할 수 있는 질문
  form.addParagraphTextItem()
    .setTitle('오늘 라이브에서 가장 기억에 남는 한 가지는 무엇이었나요?')
    .setHelpText('한 줄이면 충분합니다. 다음 강의를 만드는 데 큰 도움이 됩니다.')
    .setRequired(true);

  // 5. 개인정보 수집 동의
  form.addMultipleChoiceItem()
    .setTitle('개인정보 수집·이용 동의')
    .setHelpText(
      '수집 항목: 성함, 연락처, 주소\n' +
      '수집 목적: 책 세트 배송\n' +
      '보유 기간: 배송 완료 후 3개월 이내 파기\n' +
      '동의를 거부하실 수 있으나, 이 경우 배송이 어렵습니다.'
    )
    .setChoiceValues(['동의합니다'])
    .setRequired(true);

  // 제출 후 안내
  form.setConfirmationMessage(
    '신청이 접수되었습니다.\n' +
    '순차적으로 발송해 드리겠습니다. 책 받으시면 한 권만 펴보세요.\n' +
    '"이 정도면 나도 쓰겠는데" 싶은 게 하나는 분명히 있을 겁니다. 그게 시작입니다.'
  );

  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);  // 로그인 강제하지 않는다. 진입 마찰을 만들 이유가 없다
  form.setAllowResponseEdits(true);        // 주소 오타 정정 허용

  // 응답 시트 연결
  var ss = SpreadsheetApp.create(FORM_TITLE + ' (응답)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('─────────────────────────────');
  Logger.log('폼 생성 완료');
  Logger.log('');
  Logger.log('▶ 라이브 채팅에 올릴 주소:');
  Logger.log(form.getPublishedUrl());
  Logger.log('');
  Logger.log('▶ 주소가 쌓이는 시트:');
  Logger.log(ss.getUrl());
  Logger.log('');
  Logger.log('▶ 폼 수정하려면:');
  Logger.log(form.getEditUrl());
  Logger.log('─────────────────────────────');

  // 제출 알림 트리거
  try {
    ScriptApp.newTrigger('onFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
    Logger.log('제출 알림 설정 완료');
  } catch (err) {
    Logger.log('알림 트리거 설정 실패(수동 설정 필요): ' + err);
  }
}


/** 신청이 들어오면 메일로 알린다 */
function onFormSubmit(e) {
  if (!NOTIFY_EMAIL || !e || !e.response) return;

  var items = e.response.getItemResponses();
  var lines = ['책 세트 신청이 들어왔습니다.', ''];
  var name = '';

  items.forEach(function (it) {
    var title = it.getItem().getTitle();
    var ans = it.getResponse();
    if (title === '성함') name = ans;
    lines.push(title + ': ' + ans);
  });

  lines.push('');
  lines.push('할 일: 주소 확인 → 발송 → 문자 안내');

  try {
    MailApp.sendEmail(NOTIFY_EMAIL, '[책신청] ' + (name || '이름미상'), lines.join('\n'));
  } catch (err) {
    Logger.log('알림 발송 실패: ' + err);
  }
}
