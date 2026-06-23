# PayKing Capacitor React 작업 인수인계

이 문서는 다음 세션에서 `payking-capacitor-react` 작업을 이어가기 위한 현재 상태 요약이다.

## 작업 기준

- 현재 프로젝트는 `C:\Users\DPC\workspace\payking-capacitor-react`이다.
- 비교/마이그레이션 원본 프로젝트는 `/c/Users/DPC/workspace/payking-app`이다.
- 작업 방식은 `/c/Users/DPC/workspace/payking-app`의 React Native 구현을 읽고, 현재 프로젝트인 React + Capacitor 앱으로 마이그레이션하는 것이다.
- 구현 방향의 기준 문서는 `docs/PAYKING_APP_REBUILD_NOTES.md`이다.
- `@tanstack/react-query`는 사용하지 않는다.
- 서버 상태와 API 호출은 우선 `zustand + service 함수 + axios`로 처리한다.
- 사용자가 명시적으로 요청하지 않는 한 빌드 명령은 실행하지 않는다.
- 커밋 메시지 제안 시 컨벤셔널 커밋 형식은 지키되 내용은 한글로 작성한다.
- 각 activity의 화면 전용 Tailwind class는 파일 하단 `classes` 객체에 모으고 JSX에서는 `classes.key` 형태로 호출한다.

## 현재 주요 구현 상태

### 1. Stackflow 기반 앱 구조

- Stackflow 기반 activity 구조가 구성되어 있다.
- RN의 `navigation.navigate`, `replace`, `goBack`에 가까운 navigation adapter가 있다.
- activity registry에서 화면 이름, 제목, 인증 메타, 컴포넌트 매핑을 관리한다.
- PayKing 전용 renderer plugin으로 activity를 앱 프레임 내부 stack layer로 렌더링한다.

주요 파일:

- `src/navigation/activityRegistry.ts`
- `src/navigation/activityParams.ts`
- `src/navigation/stackflow.config.ts`
- `src/navigation/stackflow.ts`
- `src/navigation/useAppNavigation.ts`
- `src/navigation/paykingRendererPlugin.tsx`
- `src/App.css`

### 2. 모달/스택 레이아웃 보정

- stack 전환 후 `BottomModal` 위치가 꼬이는 문제를 보정했다.
- `.pk-shell`을 앱 프레임 기준 컨테이너로 두고, `.pk-stack`과 `.pk-modal-root`를 그 내부에 배치했다.
- `BottomModal`은 `.pk-modal-root`를 portal container로 사용한다.
- 하단 시트는 `fixed`가 아니라 앱 프레임 기준 `absolute`로 뜬다.
- `PKAlert`, `PKConfirm`은 복원 상태를 유지했고 별도 변경하지 않았다.

주요 파일:

- `src/navigation/paykingRendererPlugin.tsx`
- `src/App.css`
- `src/components/modal/BottomModal.tsx`
- `src/index.css`

### 3. 공통 컴포넌트

현재 결제현황/명세서 포팅에 필요한 공통 컴포넌트가 추가되어 있다.

- `AppContainer`
- `AppHeader`
- `PKText`
- `PKButton`
- `PKIconButton`
- `PKInput`
- `PKSelect`
- `PKAlert`
- `PKConfirm`
- `BottomModal`
- `PKTabBar`
- `PaymentItem`
- `PKPayStatusesChip`
- `ToggleChipGroup`

주요 파일:

- `src/components/index.ts`
- `src/components/layout/AppContainer.tsx`
- `src/components/button/PKButton.tsx`
- `src/components/button/PKIconButton.tsx`
- `src/components/button/PKMoreButton.tsx`
- `src/components/input/PKInput.tsx`
- `src/components/select/PKSelect.tsx`
- `src/components/modal/BottomModal.tsx`
- `src/components/modal/PKAlert.tsx`
- `src/components/modal/PKConfirm.tsx`
- `src/components/listItem/PaymentItem.tsx`
- `src/components/custom/PKPayStatusesChip.tsx`
- `src/components/chip/ToggleChipGroup.tsx`

### 4. 결제현황 화면 구현

`payking-app/src/screens/PaymentHistoryScreen.jsx`와 관련 결제 목록 컴포넌트를 기준으로 `PaymentHistoryActivity`를 구현했다.

구현된 기능:

- 결제현황 상단 요약
  - 조회 기간
  - 결제완료 총액
  - 총 건수
  - 정렬 select
  - 새로고침 버튼
  - 필터 버튼
- 결제 목록
  - `PaymentItem` 사용
  - 상세 클릭 시 `invoice` activity로 이동
- API 연동
  - `payments.getMyPaymentSearch`
  - `payments.getMyStatusStats`
- 무한스크롤
  - 현재 페이지 ref 관리
  - 하단 120px 접근 시 다음 페이지 append
- 필터 BottomModal
  - 키워드
  - 이용 기간
  - 결제 상태
  - 취소 요청 상태
  - 일시불/할부
  - 결제 구분
- 상세/취소 플로우 이후 목록 갱신
  - `payking:payment-history-refresh` 이벤트 수신
  - 현재 필터/정렬 조건으로 1페이지와 통계를 다시 조회

주요 파일:

- `src/activities/PaymentHistoryActivity.tsx`
- `src/components/listItem/PaymentItem.tsx`
- `src/components/custom/PKPayStatusesChip.tsx`
- `src/components/chip/ToggleChipGroup.tsx`
- `src/utils/paymentHistory.ts`

### 5. 결제 명세서 화면 구현

`payking-app/src/screens/InvoiceScreen.jsx`를 기준으로 `InvoiceActivity`를 구현했다.

구현된 기능:

- `payments.getPayDetail(id)`로 결제 상세 조회
- 결제 정보 표시
  - 항목
  - 결제요청일/결제일
  - 결제 취소 요청일
  - 결제 취소일
  - 구매자명
  - 구매자 휴대폰번호
  - 구매자 주소
  - 결제 금액
  - 문화비소득공제
  - 할부 구분
  - 결제 구분
  - 결제 상태
- 다중 transaction 표시
- 취소요청 입금정보 표시
  - `cancelRequestStatus`가 `REQUEST` 또는 `COMPLETE`일 때 표시
  - 입금금액, 입금자명, 입금은행, 입금계좌, 예금주
- 영수증 보내기
  - 카드 결제이고 성공/취소/취소요청 상태일 때 버튼 노출
  - 전화번호 입력 BottomModal
  - `payments.sendPayReceipt(id, phoneNumber)` 호출
- 결제 취소/요청 취소
  - `결제 요청 취소`
  - `결제 취소`
  - `결제 취소 요청 취소`
  - 성공 후 상세 재조회 및 결제현황 목록 갱신 이벤트 발행
- 결제 취소 요청 신규 생성
  - `cancelRequest` activity로 이동

주요 파일:

- `src/activities/InvoiceActivity.tsx`
- `src/types/payment.ts`

### 6. 결제 취소 요청 화면 구현

`payking-app/src/screens/CancelRequest.jsx`를 기준으로 `CancelRequestActivity`를 추가했다.

구현된 기능:

- `payments.getPayDetail(id)`로 결제 정보 조회
- `standard.getPayReqCancelDeposit()`로 취소요청 입금계좌 조회
- 취소금액 표시
- 입금계좌 안내 표시
- 구매자 휴대폰번호, 결제상품, 결제금액 표시
- 입금자명 입력
- 확인 모달 후 `payments.cancelPay(id, data)` 호출
  - `cancelReqStatus: 'REQUEST'`
  - 입금계좌/은행/예금주/입금금액/입금자명 payload 포함
- 성공 후
  - `payking:invoice-refresh` 이벤트 발행
  - `payking:payment-history-refresh` 이벤트 발행
  - 이전 화면으로 이동

주요 파일:

- `src/activities/CancelRequestActivity.tsx`
- `src/navigation/activityParams.ts`
- `src/navigation/activityRegistry.ts`
- `src/navigation/stackflow.config.ts`

### 7. 결제 취소 권한 조건 복원

RN 기준 권한 조건을 Capacitor 프로젝트에 반영했다.

조건:

- `user.authority === 'MANAGE'`
- 또는 `authes.isPayCancel === true`

구현:

- `userStore`에 `authes` 상태 추가
- `user.authority !== 'MANAGE'`인 경우 `userService.getAuth(userNo)` 호출
- `InvoiceActivity`에서 취소 관련 버튼 노출 조건에 권한 반영
- `CancelRequestActivity` 직접 진입 시에도 권한이 없으면 알림 후 뒤로가기

주요 파일:

- `src/stores/userStore.ts`
- `src/activities/InvoiceActivity.tsx`
- `src/activities/CancelRequestActivity.tsx`

### 8. 결제 도메인 타입 공통화

결제 상세/취소요청 화면에서 중복 선언하던 API 응답 타입을 공통 타입 파일로 분리했다.

추가 타입:

- `PaymentTransaction`
- `CancelRequestDeposit`
- `PaymentDetail`
- `CancelPayResult`

주요 파일:

- `src/types/payment.ts`
- `src/activities/InvoiceActivity.tsx`
- `src/activities/CancelRequestActivity.tsx`

### 9. 모바일 레이아웃 보정

실제 모바일 화면에서 깨질 가능성이 있는 부분을 정적으로 점검하고 보정했다.

보정 내용:

- `InvoiceActivity`
  - 긴 label/value 행에서 값 영역이 밀리지 않도록 grid column 조정
  - 하단 2버튼이 균등 배치되도록 `flex-1 min-w-0` 적용
- `CancelRequestActivity`
  - 하단 2버튼 균등 배치
- `PaymentHistoryActivity`
  - 상단 toolbar가 좁은 화면에서 줄바꿈 가능하도록 조정

주의:

- Vite dev server는 같은 PowerShell 세션 내에서 HTTP 200 응답을 확인했다.
- 인앱 브라우저 연결은 런타임 경로 문제로 스크린샷 QA까지 완료하지 못했다.
- 로그인 후 실제 API 데이터 기반 모바일 QA는 아직 남아 있다.

## 현재 검증 상태

최근 확인:

- `git diff --check` 통과
- 관련 파일 trailing whitespace 검사 통과
- Vite dev server는 같은 세션 내 HTTP 200 응답 확인

실행하지 않은 것:

- 사용자가 명시적으로 요청하지 않았으므로 빌드 명령은 실행하지 않았다.
- TypeScript 빌드/타입체크 명령도 실행하지 않았다.

## 현재 git/작업 상태 메모

- 현재 `payking-capacitor-react`는 git 상태 확인이 가능하다.
- 여러 파일이 이미 수정/추가된 상태다.
- 새로 추가된 주요 파일:
  - `src/activities/InvoiceActivity.tsx`
  - `src/activities/CancelRequestActivity.tsx`
  - `src/types/payment.ts`
  - `src/utils/paymentHistory.ts`
  - `src/components/listItem/PaymentItem.tsx`
  - `src/components/custom/PKPayStatusesChip.tsx`
  - `src/components/chip/ToggleChipGroup.tsx`
  - `src/components/select/PKSelect.tsx`
  - `src/components/button/PKMoreButton.tsx`

## 남은 작업 추천 순서

### 1. 결제현황 필터 초기화 버튼 추가

목표:

- 필터 BottomModal에 초기화 버튼 추가
- `initFilter`로 modal filter 리셋
- 적용 상태 표시가 필요하면 summary 또는 filter button 상태로 확장

대상 파일:

- `src/activities/PaymentHistoryActivity.tsx`

### 2. 실제 모바일 QA

목표:

- 로그인 후 실제 API 데이터로 다음 화면을 확인한다.
  - 결제현황
  - 결제 명세서
  - 영수증 보내기 BottomModal
  - 결제 취소 confirm
  - 결제 취소 요청 화면
- 320px, 375px, 430px 폭 기준으로 텍스트 겹침/하단 버튼/모달 위치 확인

주의:

- QA 중 실제 취소/영수증 전송은 외부 효과가 있으므로 테스트 계정/테스트 결제 데이터로만 진행해야 한다.

### 3. 결제현황 API 타입 확장

목표:

- `PaymentListItem`을 `src/types/payment.ts`로 이동하거나 확장
- 결제 상태/취소요청 상태 union type 정리
- `PaymentHistorySearchParams`, stats 응답 타입도 공통화 검토

대상 파일:

- `src/types/payment.ts`
- `src/activities/PaymentHistoryActivity.tsx`
- `src/components/listItem/PaymentItem.tsx`

### 4. 정기결제 명세서 보기 이식

RN `InvoiceScreen.jsx`에는 `payType === 'RECURRING'`일 때 정기결제 명세서 보기 버튼이 있다.

남은 작업:

- `payments.getRecurringPayPayment(id)` 연결
- 이동 대상 activity 설계
- 기존 `subscriptionDetail` 화면 마이그레이션 범위 확인

### 5. 인증/메인 탭 후속 정리

초기 문서의 인증/메인 탭 작업은 일부 진행된 상태지만, 현재 우선순위는 결제현황 마이그레이션이다.

남은 작업:

- 로그인 성공 이동 목적지 최종 확정
- `homeMain` 탭 shell과 실제 탭별 화면 범위 정리
- `userHome` 임시 인증 샘플 화면 유지/제거 판단

## 작업 스타일 메모

- 파일 검색 시 Windows sandbox 문제가 생기면 복잡한 `rg`/긴 파이프라인 반복 대신 단순 `Get-ChildItem`, `Get-Content -Encoding UTF8` 위주로 진행한다.
- 한글 주석/문자열이 있으므로 파일 읽기는 UTF-8을 명시한다.
- `apply_patch`로 파일 수정하는 것을 우선한다.
- 빌드는 사용자가 요청하기 전까지 실행하지 않는다.
- 최종 응답에는 다음 작업 순서를 포함한다.
