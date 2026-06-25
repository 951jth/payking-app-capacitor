# PayKing Capacitor React 작업 인수인계

이 문서는 다음 세션에서 `payking-capacitor-react` 작업을 이어가기 위한 현재 상태 요약이다.

## 작업 기준

- 현재 프로젝트는 `C:\Users\DPC\workspace\payking-capacitor-react`이다.
- 비교/마이그레이션 원본 프로젝트는 `C:\Users\DPC\workspace\payking-app`이다.
- 기존 PayKing React Native 앱을 React + Capacitor 기반으로 재구성하고 있다.
- 상세 재구성 노트는 `docs/PAYKING_APP_REBUILD_NOTES.md`를 참고한다.
- README는 현재 실행/빌드 흐름 기준으로 갱신되어 있다.
- `@tanstack/react-query`는 1차 재구성 범위에서 제외한다.
- 서버 상태와 API 호출은 우선 `zustand + service 함수 + axios`로 처리한다.
- 사용자가 명시적으로 요청하지 않는 한 빌드 명령은 실행하지 않는다.
- 커밋 메시지 제안 시 컨벤셔널 커밋 형식은 지키되 내용은 한글로 작성한다.
- 각 activity의 화면 전용 Tailwind class는 파일 하단 `classes` 객체에 모으고 JSX에서는 `classes.key` 형태로 호출한다.

## 앱 식별자와 표시명

현재 Capacitor 앱은 기존 네이티브 앱과 구분되도록 Web 버전 이름을 사용한다.

- Capacitor appId: `kr.co.payking.web`
- Android namespace/applicationId: `kr.co.payking.web`
- iOS PRODUCT_BUNDLE_IDENTIFIER: `kr.co.payking.web`
- 앱 표시명: `페이킹 플러스 Web`
- 웹 빌드 출력: `dist`
- 기본 로드 방식: 오리진 버전, 즉 `dist` 번들을 네이티브 앱에 포함

주요 파일:

- `capacitor.config.ts`
- `capacitor.server.ts`
- `android/app/build.gradle`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/java/kr/co/payking/web/MainActivity.java`
- `ios/App/App/Info.plist`
- `ios/App/App.xcodeproj/project.pbxproj`

## Capacitor 네이티브 플랫폼 상태

Android와 iOS 플랫폼이 모두 추가되어 있다.

- Android 폴더: `android`
- iOS 폴더: `ios`
- `npm.cmd exec cap sync`를 실행해 Android/iOS 내부 `capacitor.config.json`에 최신 appId/appName이 반영되어 있다.
- Windows에서는 Android 빌드/실행 가능하다.
- iOS 빌드/실행은 macOS + Xcode가 필요하다.

주의:

- `android`와 `ios`는 현재 git 기준 untracked 상태일 수 있다.
- `cap sync`는 `dist`를 네이티브 프로젝트에 복사하므로, 웹 코드 변경 후 앱에 반영하려면 먼저 웹 빌드가 필요하다.

## 스플래시/앱 아이콘 포팅 상태

`payking-app`의 스플래시/앱 아이콘 설정을 확인한 뒤 Capacitor 프로젝트에 반영했다.

원본 확인 결과:

- Android 원본은 `react-native-splash-screen`을 사용한다.
- Android `launch_screen.xml`은 흰 배경만 표시하며 중앙 이미지/텍스트는 주석 처리되어 있다.
- iOS `LaunchScreen.storyboard`도 흰 배경만 표시한다.
- Android 앱 아이콘은 밀도별 `mipmap-*` PNG 세트다.
- iOS 앱 아이콘은 `AppIcon.appiconset`, `AppIconDEV.appiconset` 두 세트다.

현재 반영 상태:

- Android `mipmap-*`의 `ic_launcher.png`, `ic_launcher_round.png`를 원본 PayKing Plus 아이콘으로 교체했다.
- Android 기본 Capacitor adaptive icon XML은 제거해 원본 PNG 아이콘을 사용하게 했다.
- Android SplashScreen 테마는 흰 배경 + 투명 아이콘으로 설정했다.
- iOS `LaunchScreen.storyboard`를 원본 흰 배경 스토리보드로 교체했다.
- iOS `AppIcon.appiconset`, `AppIconDEV.appiconset`을 원본에서 복사했다.
- iOS Debug는 `AppIconDEV`, Release는 `AppIcon`을 사용한다.
- iOS 방향 설정은 원본 앱처럼 portrait 기준으로 정리했다.

주요 파일:

- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/res/drawable/splash_icon_transparent.xml`
- `ios/App/App/Base.lproj/LaunchScreen.storyboard`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset`
- `ios/App/App/Assets.xcassets/AppIconDEV.appiconset`

## 웹/네이티브 로드 방식

현재 기본은 앱에 `dist` 번들을 포함하는 오리진 버전이다.

기준 파일:

- `capacitor.server.ts`

현재 값:

```ts
export const CAPACITOR_SERVER_URL = "";
```

운영 흐름:

- 오리진 버전: `yarn build` 후 `yarn cap sync`
- 웹 분리 버전: `CAPACITOR_SERVER_URL`에 원격 URL 설정 후 `yarn cap sync`
- URL 변경 후에는 반드시 `cap sync`가 필요하다.

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

### 2. 네이티브/브라우저 뒤로가기 처리

- Capacitor native back button을 Stackflow pop과 연결하는 처리가 추가되어 있다.
- overlay/modal 상태를 고려하는 back overlay 유틸이 추가되어 있다.
- 루트 화면에서는 앱 종료 또는 이전 단계 정책 확인이 필요하다.

주요 파일:

- `src/navigation/NavigationBackHandler.tsx`
- `src/navigation/performBackNavigation.ts`
- `src/navigation/useTopActivity.ts`
- `src/hooks/useBackOverlay.ts`
- `src/stores/overlayStore.ts`

### 3. 공통 UI와 모바일 레이아웃

- 앱 프레임, 헤더, 버튼, 입력, 모달, 탭, 리스트 placeholder 등 공통 UI가 구성되어 있다.
- 모바일 기준 버튼/입력/모달 터치 영역과 pressable 유틸이 정리되는 중이다.
- `BottomModal`은 앱 프레임 내부 portal 기준으로 뜨도록 조정되어 있다.

주요 파일:

- `src/components/layout/AppContainer.tsx`
- `src/components/navigation/AppHeader.tsx`
- `src/components/navigation/PKTabBar.tsx`
- `src/components/button/PKButton.tsx`
- `src/components/button/PKIconButton.tsx`
- `src/components/button/PKMoreButton.tsx`
- `src/components/input/PKInput.tsx`
- `src/components/modal/BottomModal.tsx`
- `src/components/modal/PKConfirm.tsx`
- `src/components/modal/GlobalPKAlertRenderer.tsx`
- `src/utils/pressable.ts`

### 4. 현재 activity 범위

activity registry 기준 주요 화면:

- `login`
- `findId`
- `findPw`
- `homeMain`
- `paymentHistory`
- `invoice`
- `cancelRequest`
- `settlementHistory`
- `linkPayment`
- `setting`
- `userHome`
- `sampleHome`
- `sampleDetail`

주요 구현 파일:

- `src/activities/LoginActivity.tsx`
- `src/activities/HomeMainActivity.tsx`
- `src/activities/PaymentHistoryActivity.tsx`
- `src/activities/InvoiceActivity.tsx`
- `src/activities/CancelRequestActivity.tsx`
- `src/activities/SettlementHistoryActivity.tsx`
- `src/activities/LinkPaymentActivity.tsx`
- `src/activities/SettingActivity.tsx`

### 5. 결제현황/결제 명세서/취소 요청

기존 작업에서 RN 기준 결제현황, 결제 명세서, 결제 취소 요청 흐름이 상당 부분 포팅되어 있다.

주요 내용:

- 결제현황 목록/필터/정렬/무한스크롤
- 결제 상세 조회
- 영수증 보내기 BottomModal
- 결제 취소/요청 취소/취소 요청 생성
- 결제 취소 권한 조건 복원
- 결제 상세/취소요청 타입 일부 공통화

주요 파일:

- `src/activities/PaymentHistoryActivity.tsx`
- `src/activities/InvoiceActivity.tsx`
- `src/activities/CancelRequestActivity.tsx`
- `src/types/payment.ts`
- `src/utils/paymentHistory.ts`
- `src/components/listItem/PaymentItem.tsx`
- `src/components/chip/PKChip.tsx`
- `src/components/custom/PKPayStatusesChip.tsx`
- `src/components/custom/PKSettlementStatusesChip.tsx`
- `src/components/radio/PKRadioGroup.tsx`

## 현재 검증 상태

최근 확인한 것:

- `npm.cmd exec cap sync` 정상 완료
- Android/iOS 내부 `capacitor.config.json`에 `kr.co.payking.web`, `페이킹 플러스 Web` 반영 확인
- `git diff --check` 통과
- Android 대표 아이콘이 원본 PayKing Plus 아이콘으로 교체된 것 확인

실행하지 않은 것:

- 사용자가 명시적으로 요청하지 않았으므로 최종 네이티브 빌드는 이 문서 갱신 과정에서 실행하지 않았다.
- TypeScript 빌드/타입체크도 이 문서 갱신 과정에서 실행하지 않았다.
- iOS 빌드는 Windows 환경에서 실행할 수 없다.

권장 검증 명령:

```powershell
cd C:\Users\DPC\workspace\payking-capacitor-react
yarn build
npm.cmd exec cap sync
cd android
.\gradlew.bat assembleDebug
```

Android 기기/에뮬레이터 실행:

```powershell
cd C:\Users\DPC\workspace\payking-capacitor-react
npm.cmd exec cap run android
```

확인 포인트:

- 앱 표시명이 `페이킹 플러스 Web`인지
- 패키지명이 `kr.co.payking.web`인지
- 기존 네이티브 앱과 나란히 설치되는지
- 런처 아이콘이 PayKing Plus 아이콘인지
- 실행 시 기본 Capacitor 로고가 보이지 않고 흰 스플래시만 보이는지
- 로그인/홈/결제현황/명세서/모달/뒤로가기 흐름이 모바일에서 깨지지 않는지

## 현재 git/작업 상태 메모

현재 작업 트리에는 여러 수정 파일이 있다.

특히 다음 항목은 현재 세션 이전/중에 생성 또는 수정된 상태일 수 있다.

- `README.md`
- `capacitor.config.ts`
- `capacitor.server.ts`
- `docs/HANDOFF_WORK_LOG.md`
- `android/`
- `ios/`
- `src/navigation/NavigationBackHandler.tsx`
- `src/navigation/performBackNavigation.ts`
- `src/navigation/useTopActivity.ts`
- `src/hooks/useBackOverlay.ts`
- `src/stores/overlayStore.ts`
- `src/utils/pressable.ts`

주의:

- `android/app/build` 같은 빌드 산출물이 생겨 있을 수 있으므로 커밋 전 `.gitignore`와 `git status`를 확인한다.
- 기존 사용자 변경이 섞여 있으므로 unrelated 파일은 되돌리지 않는다.
- 커밋 전에는 `git diff --check`를 먼저 확인한다.
