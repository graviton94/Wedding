# Google Forms와 방명록 연동 가이드

이 가이드는 Google Forms 제출 시 자동으로 방명록 스프레드시트에 데이터를 업데이트하는 방법을 설명합니다.

## 📋 개요

Google Form을 통해 제출된 성함과 축하 메세지가 blank가 아닌 경우, 자동으로 방명록 스프레드시트에 다음 정보를 업데이트합니다:
- **이름** (forms 성함 → 방명록 From 컬럼)
- **축하 메세지** (forms 축하 메세지 → 방명록 본문 컬럼)
- **제출 시간** (자동 생성)

## 🔧 설정 방법

### 1단계: Google Form 설정

Google Form에 다음 필드가 포함되어 있는지 확인하세요:
- **성함** (또는 "이름"으로 질문 제목에 포함)
- **축하 메세지** (질문 제목에 "축하"와 "메세지" 또는 "메시지" 포함)

### 2단계: Google Apps Script 설정

1. Google Form을 엽니다
2. 오른쪽 상단의 점 3개(⋮) 메뉴를 클릭
3. **"스크립트 편집기"** 선택
4. 새 창이 열리면 `FormToGuestbook.gs` 파일의 내용을 복사하여 붙여넣기
5. 스크립트 상단의 `GUESTBOOK_SPREADSHEET_ID` 값을 확인/수정
   ```javascript
   const GUESTBOOK_SPREADSHEET_ID = '1-xtZaFSMU8ecMEzsCiWyplELJS9XRpET3SB_cUje1T4';
   ```
6. **"저장"** 버튼 클릭 (💾)

### 3단계: 트리거 설정

1. 스크립트 편집기에서 왼쪽 메뉴의 **시계 아이콘** (트리거) 클릭
2. 오른쪽 하단의 **"+ 트리거 추가"** 버튼 클릭
3. 다음과 같이 설정:
   - **실행할 함수 선택**: `onFormSubmit`
   - **실행할 배포 선택**: `Head`
   - **이벤트 소스 선택**: `양식에서`
   - **이벤트 유형 선택**: `양식 제출 시`
4. **"저장"** 클릭
5. Google 계정 권한 승인 (처음 한 번만 필요)

### 4단계: 방명록 스프레드시트 구조 확인

방명록 스프레드시트의 첫 번째 시트는 다음과 같은 구조여야 합니다:

| From (성함) | 본문 (메세지) | 날짜 |
|------------|-------------|------|
| 홍길동      | 축하합니다!  | 2026-01-22 15:30:00 |

스크립트는 자동으로 새 행을 추가합니다.

## 🧪 테스트 방법

### 방법 1: 실제 Form 제출
1. Google Form을 열고 테스트 데이터 제출
2. 방명록 스프레드시트에 새 행이 추가되었는지 확인

### 방법 2: 스크립트 로그 확인
1. 스크립트 편집기에서 **"실행"** > `testScript` 선택
2. **"로그"** 버튼 클릭하여 스프레드시트 연결 확인

## ⚠️ 주의사항

1. **필드명 일치**: Form의 질문 제목에 "성함"과 "축하 메세지"가 정확히 포함되어야 합니다
2. **빈 값 처리**: 이름 또는 메세지가 비어있으면 방명록에 추가되지 않습니다
3. **권한**: 스크립트가 Form과 Spreadsheet에 접근할 수 있도록 권한 승인이 필요합니다
4. **시간대**: 타임스탬프는 Google Apps Script의 시간대 설정을 따릅니다

## 🔍 문제 해결

### 데이터가 추가되지 않는 경우
1. 스크립트 편집기에서 **"실행"** > **"로그"** 확인
2. Form 필드명이 "성함"과 "축하 메세지"를 포함하는지 확인
3. 트리거가 올바르게 설정되었는지 확인
4. 스프레드시트 ID가 정확한지 확인

### 권한 오류가 발생하는 경우
1. 트리거 설정 시 Google 계정 권한 재승인
2. Form과 Spreadsheet 소유자가 동일한지 확인

## 📝 스크립트 커스터마이징

### 필드명 변경
스크립트의 47-56번째 줄에서 필드명 매칭 로직을 수정할 수 있습니다:

```javascript
// 성함 필드 찾기
if (question.includes('성함') || question.includes('이름')) {
  name = answer;
}

// 축하 메세지 필드 찾기
if (question.includes('축하') && (question.includes('메세지') || question.includes('메시지'))) {
  message = answer;
}
```

### 날짜 형식 변경
64번째 줄에서 날짜 형식을 변경할 수 있습니다:

```javascript
const formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
```

## 📚 참고 자료

- [Google Apps Script 문서](https://developers.google.com/apps-script)
- [SpreadsheetApp 레퍼런스](https://developers.google.com/apps-script/reference/spreadsheet)
- [Form 트리거 가이드](https://developers.google.com/apps-script/guides/triggers/events)

## 💡 추가 기능 아이디어

- 이메일 알림: 새 방명록 작성 시 이메일 전송
- 데이터 검증: 욕설 필터링 또는 스팸 방지
- 중복 제출 방지: 동일 이름/메세지 체크
- 자동 응답: Form 제출자에게 감사 메일 발송
