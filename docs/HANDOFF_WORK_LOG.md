# PayKing Capacitor React 작업 인수인계

이 문서는 다음 터미널/세션에서 작업을 이어가기 위한 현재 상태 요약이다. 구현 방향의 기준 문서는 `docs/PAYKING_APP_REBUILD_NOTES.md`이고, 이 문서는 실제 진행된 변경 사항과 남은 작업을 빠르게 파악하기 위한 로그다.

## 작업 기준

- 기존 `payking-app` React Native 앱을 React + Capacitor 기반으로 재구성한다.
- 디자인은 기존 `payking-app`을 최대한 따른다.
- `@tanstack/react-query`는 사용하지 않는다.
- 서버 상태와 API 호출은 우선 `zustand + service 함수 + axios`로 처리한다.
- 빌드 명령은 사용자가 명시적으로 요청하지 않는 한 실행하지 않는다.
- 커밋 메시지 제안 시 컨벤셔널 커밋 형식은 지키되 내용은 한글로 작성한다.

## 완료된 작업

### 1. 앱 골격 생성

- Vite 기본 샘플 UI를 제거했다.
- Stackflow 기반 activity 구조를 만들었다.
- RN의 `navigation.navigate`, `replace`, `goBack`에 가까운 navigation adapter를 만들었다.
- 샘플 activity 2개를 추가했다.
  - `sampleHome`
  - `sampleDetail`

주요 파일:

- `src/App.tsx`
- `src/app/AppProviders.tsx`
- `src/navigation/activityRegistry.ts`
- `src/navigation/stackflow.config.ts`
- `src/navigation/stackflow.ts`
- `src/navigation/useAppNavigation.ts`
- `src/activities/SampleHomeActivity.tsx`
- `src/activities/SampleDetailActivity.tsx`

### 2. Stackflow 렌더러 보정

초기에는 `@stackflow/plugin-renderer-basic`을 사용했으나, 이 플러그인은 activity를 단순히 Fragment로 나열해서 새 화면이 기존 화면 아래에 붙는 문제가 있었다.

해결:

- PayKing 전용 renderer plugin을 추가했다.
- activity를 `.pk-stack` 내부 fixed-size 앱 프레임에 `absolute` layer로 쌓는다.
- `transitionState` 기반 slide-in / slide-out 애니메이션을 CSS로 적용했다.
- `.pk-stack`은 데스크톱 브라우저에서 430px 너비로 중앙 배치하고, 바깥 영역은 blur/shadow 처리했다.

주요 파일:

- `src/navigation/paykingRendererPlugin.tsx`
- `src/navigation/stackflow.ts`
- `src/App.css`

### 3. 폰트 세팅

기존 `payking-app`에서 사용하는 폰트를 가져왔다.

- S-CoreDream 9종 `.ttf`
- Pretendard 9종 `.otf`

주의:

- `payking-app/src/assets/fonts/pretendard.base64.js`는 실제 폰트 데이터가 아니라 placeholder였다.
- 실제 Pretendard 파일은 `payking-app/android/app/src/main/assets/fonts`에서 복사했다.

주요 파일:

- `src/assets/fonts/*`
- `src/styles/fonts.css`
- `src/utils/font.ts`
- `src/index.css`

전역 기본 폰트:

- `--pk-font-scd`: S-CoreDream
- `--pk-font-ptd`: Pretendard

현재 기본 body font는 `S-CoreDream`이다.

### 4. 공통 컴포넌트 웹 이식

기존 RN 컴포넌트 API를 완전히 복제하지 않고, 화면 포팅에 필요한 형태로 웹 공통 컴포넌트를 만들었다.

추가 컴포넌트:

- `AppContainer`
- `PKText`
- `PKButton`
- `PKInput`
- `PKAlert`
- `PKConfirm`
- `BottomModal`
- `AppHeader`
- `PKTabBar`

주요 파일:

- `src/components/layout/AppContainer.tsx`
- `src/components/typography/PKText.tsx`
- `src/components/button/PKButton.tsx`
- `src/components/input/PKInput.tsx`
- `src/components/modal/PKAlert.tsx`
- `src/components/modal/PKConfirm.tsx`
- `src/components/modal/BottomModal.tsx`
- `src/components/navigation/AppHeader.tsx`
- `src/components/navigation/PKTabBar.tsx`
- `src/components/index.ts`
- `src/styles/components.css`

샘플 activity는 현재 이 공통 컴포넌트들을 사용한다.

### 5. 서비스 레이어 TS 변환 및 axios 공통 인스턴스

사용자가 기존 `payking-app` 서비스 레이어를 가져온 상태에서 작업했다.

변경:

- `src/service/*.js`를 `.ts`로 변환했다.
- `@service/axios/index` alias import를 상대 경로로 바꿨다.
- `qs` 패키지를 쓰지 않고 내부 query string 유틸로 대체했다.
- `src/service/axios/index.ts`를 웹/Capacitor 기준으로 새로 작성했다.

주요 파일:

- `src/service/axios/index.ts`
- `src/utils/queryString.ts`
- `src/config/env.ts`
- `src/stores/sessionStore.ts`

axios 인스턴스:

- `authInstance`
  - access token을 `access_token` header에 주입한다.
  - 401 + `Expired token`이면 refresh 후 원 요청을 재시도한다.
  - 401 + `Block Token`이면 logout 처리한다.
- `noAuthInstance`
  - device token을 `access_token` header에 주입한다.

환경 변수:

- Vite에서는 API URL을 `VITE_API_URL`로 읽는다.
- `.env` 예시:

```env
VITE_API_URL=https://example-api-url
```

서비스 파일의 개별 payload/response 타입은 아직 넓게 유지했다. 화면 연동 시점에 도메인별로 좁히는 방향이 맞다.

### 6. 공통 기반 생성

Capacitor 기반 공통 어댑터와 store를 만들었다.

추가:

- Capacitor Preferences 기반 Zustand persist storage
- Device adapter
- Network adapter
- deviceStore
- globalStore
- app runtime hook

주요 파일:

- `src/storage/preferencesStorage.ts`
- `src/adapters/deviceAdapter.ts`
- `src/adapters/networkAdapter.ts`
- `src/stores/deviceStore.ts`
- `src/stores/globalStore.ts`
- `src/app/useAppRuntime.ts`
- `src/app/AppProviders.tsx`

역할:

- `preferencesStorage`
  - Zustand persist를 Capacitor Preferences에 저장한다.
- `useSessionStore`
  - `accessToken`, `deviceToken` 저장
- `useDeviceStore`
  - Capacitor `Device`, `App` 기반 device info 생성
  - 디바이스 등록 API 호출
  - device token 발급 API 호출
- `useGlobalStore`
  - app foreground/background 상태
  - CS 정보
  - guide link 정보
- `useAppRuntime`
  - Capacitor App appStateChange listener
  - Network status listener

### 7. 디바이스 등록 및 API 환경 설정

`payking-link`의 웹 디바이스 등록 흐름을 참고해 웹/Capacitor 공통 등록 구조를 보강했다.

변경:

- 웹 접속 시 `osType`은 `WEB`으로 보낸다.
- `navigator.userAgent`를 `model`로 사용한다.
- 브라우저명/버전을 `osVersion`으로 파싱한다.
- 저장된 UUID가 있으면 재사용하고, 없으면 신규 UUID를 생성한다.
- 앱 시작 시 session/device store hydration 완료 후 자동으로 디바이스 등록과 device token 발급을 시도한다.
- 로그인 화면에서 device token이 없으면 로그인 버튼을 비활성화하고 재시도 UX를 제공한다.

주요 파일:

- `src/adapters/deviceAdapter.ts`
- `src/stores/deviceStore.ts`
- `src/app/useAppRuntime.ts`
- `src/activities/LoginActivity.tsx`

API 환경 변수:

- `.env`는 Vite 규칙에 맞춰 `VITE_` prefix를 사용한다.
- `VITE_API_URL`은 axios `baseURL`로 사용된다.
- 값이 없으면 개발계 `https://api-dev.pay-king.co.kr`로 fallback된다.
- `src/config/env.ts`에서 trailing slash를 제거한다.

### 8. 로그인 API 및 인증 API 샘플

기존 RN `LoginScreen.jsx`와 동일한 payload로 로그인 API를 연결했다.

로그인 요청:

```ts
{
  'device-token': deviceToken,
  'access-point': 'APP',
  username: id,
  password
}
```

로그인 성공 처리:

- `response.data.token` 또는 `response.data.data.token`을 access token으로 인식한다.
- `useSessionStore.setAccessToken(token)`으로 저장한다.
- `userHome` activity로 `replace` 이동한다.

인증 API 샘플:

- `userHome` 진입 시 `userService.getMyInfo({})`를 호출한다.
- 이 호출은 `authInstance`를 사용하므로 access token header 주입과 401 refresh 흐름을 확인하는 샘플 역할을 한다.
- 화면의 `인증 API 재호출` 버튼으로 수동 재시도할 수 있다.

401 처리:

- `authInstance`는 401 + `Expired token` 응답이면 `/api/auth/v1/refresh`를 호출한다.
- refresh 성공 시 새 access token을 저장하고 원 요청을 재시도한다.
- refresh 실패 또는 401 + `Block Token`이면 `logout()`으로 access token을 제거한다.
- access token이 제거되면 `AuthRouteGuard`가 인증 activity에서 `login`으로 돌려보낸다.

주요 파일:

- `src/activities/LoginActivity.tsx`
- `src/activities/UserHomeActivity.tsx`
- `src/service/axios/index.ts`
- `src/service/user.ts`

## 현재 검증 상태

마지막 확인 기준:

```bash
.\node_modules\.bin\eslint.cmd .
.\node_modules\.bin\tsc.cmd --noEmit -p tsconfig.app.json
```

둘 다 통과했다.

빌드 명령은 사용자 규칙에 따라 실행하지 않았다.

## 알려진 주의사항

### yarn 실행 이슈

PowerShell에서 `yarn`은 실행 정책 때문에 `yarn.ps1`이 막힐 수 있다. 이 경우 `yarn.cmd`를 사용한다.

```bash
yarn.cmd dev
```

### yarn add 이슈

이전에 `@stackflow/config`, `@stackflow/core` 추가 과정에서 Windows 파일 잠금 때문에 `@rolldown` native binding unlink 단계가 실패한 적이 있다. `package.json`에는 의존성을 반영했고, `node_modules`에는 패키지가 내려받아져 타입 검사는 통과했다.

추후 의존성 정리가 필요하면 dev server, Cursor/Node 프로세스 종료 후 재설치하는 것이 안전하다.

### git 상태

`payking-capacitor-react` 폴더는 현재 git 저장소로 인식되지 않았다. 그래서 `git status`, `git diff --check` 기반 검증은 사용할 수 없었다.

### TypeScript 설정

서비스 레이어를 기존 JS 호환 형태로 변환하기 위해 `tsconfig.app.json`에 다음 설정을 추가했다.

```json
"noImplicitAny": false
```

이건 임시 품질 저하라기보다, 기존 서비스 함수가 매우 넓은 payload를 받기 때문에 화면 연동 전 단계에서 현실적으로 선택한 설정이다. 이후 화면별로 payload/response 타입을 좁힐 수 있다.

## 다음 작업 순서

### 4번. 인증 플로우 구현

우선순위가 가장 높다.

목표:

- `permission`
- `findId`
- `findPw`
- 로그인 후 `homeMain` 진입
- 로그인 실패/디바이스 등록 실패 UX 정교화

구현 방향:

- `login` activity와 로그인 API 연동은 완료됐다.
- 현재 로그인 성공 시 임시 `userHome`으로 진입한다.
- 다음 단계에서 `homeMain` activity를 만들고 로그인 성공 이동 목적지를 교체한다.
- `standard.getCSInfo()`는 문의하기 모달 연결 시 필요하다.

참고할 기존 RN 파일:

- `payking-app/src/screens/auth/LoginScreen.jsx`
- `payking-app/src/screens/auth/FindIDScreen.jsx`
- `payking-app/src/screens/auth/FindPWScreen.jsx`
- `payking-app/src/screens/auth/PermissionScreen.jsx`
- `payking-app/src/navigation/RootNavigator.jsx`
- `payking-app/src/hook/useScreens.js`

### 5번. 메인 탭 shell 구현

인증 플로우 후 진행한다.

목표:

- `homeMain` activity 추가
- 내부 `TabLayout` 상태 관리
- 홈 / 결제현황 / 링크QR 액션 / 정산현황 / 메뉴 탭 shell 구성
- 기존 `MainTabNavigator`와 `CustomTabBar` 시각 구조 유지

참고할 기존 RN 파일:

- `payking-app/src/navigation/MainTabNavigator.jsx`
- `payking-app/src/components/tabs/CustomTabBar.jsx`
- `payking-app/src/hook/useScreens.js`

### 6번. 네이티브 기능 매핑

메인 shell 이후 진행한다.

분류 대상:

- Camera
- Push Notifications
- Deeplink
- WebView
- Device info
- Network status
- 카드 OCR / 키인 결제

주의:

- `CardScanScreen`은 RN `NativeModules.NativeViewManager.presentOCRView`에 강하게 묶여 있으므로, Capacitor 커스텀 플러그인 후보로 분리해야 한다.

## 작업 스타일 메모

- 파일 검색 시 Windows sandbox 문제가 생기면 복잡한 `rg`/긴 파이프라인 반복 대신 단순 `Get-ChildItem`, `Get-Content -Encoding UTF8` 위주로 진행한다.
- 한글 주석/문자열이 있으므로 파일 읽기는 UTF-8을 명시한다.
- `apply_patch`로 파일 수정하는 것을 우선한다.
- 빌드는 사용자가 요청하기 전까지 실행하지 않는다.
- 최종 응답에는 항상 다음 작업 순서를 포함한다.
- 각 screen/activity의 화면 전용 스타일은 Tailwind class로 작성한다.
- activity 내부 Tailwind class 문자열은 파일 하단의 `classes` 객체에 모으고, JSX에서는 `classes.key` 형태로 호출한다.
- 공통 컴포넌트 재사용 스타일은 `src/styles/components.css`에 둔다.
