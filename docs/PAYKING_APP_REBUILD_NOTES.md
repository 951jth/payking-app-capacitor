# PayKing App Rebuild Notes

## 1차 목표

- 기존 `payking-app`의 React Native 구조를 참고해 React + Capacitor 기반 앱으로 재구성한다.
- 1차 구현 범위는 로그인, 인증 상태 분기, 메인 탭 진입까지로 잡는다.
- 초기 단계부터 React Native의 `navigation.navigate('screenName', params)` 사고방식과 최대한 유사한 구조를 사용한다.

## 기존 PayKing 앱 구조 요약

- 현재 앱은 React Native 기반이다.
- 진입점은 `App.jsx`이며, `RootNavigator`, `AppNavigator`, `MainTabNavigator`로 화면이 구성된다.
- 화면 정의는 `src/hook/useScreens.js`에 중앙화되어 있다.
- 주요 도메인은 결제 링크/QR, 카드 스캔 결제, 결제 현황, 정산, 현금영수증, 상품, 부계정, 설정, 알림이다.
- 상태 관리는 Zustand를 사용하고, API 호출은 Axios 기반 service 계층으로 분리한다.
- `@tanstack/react-query`는 1차 재구성 범위에서 제외한다. 서버 상태 캐싱이 필요한 경우에도 초기 구현 이후 별도 단계에서 재검토한다.
- 네이티브 의존 기능은 FCM/Notifee, 권한, 카메라/갤러리, 연락처, 디바이스 정보, 딥링크, WebView, 카드 OCR/키인 결제 모듈이다.
- `CardScanScreen`은 `NativeModules.NativeViewManager.presentOCRView`에 강하게 묶여 있어 추후 Capacitor 커스텀 플러그인 검토가 필요하다.

## 라우팅 방향

`useRoutes` 기반 URL 라우팅은 사용하지 않는다. PayKing은 웹사이트보다 모바일 앱에 가까우며, 리스트/상세 왕복과 탭 위 상세 화면 진입이 많다. 따라서 React Native와 가장 유사한 screen stack 모델을 우선한다.

선택 방향:

- Stackflow를 메인 내비게이션 엔진으로 사용한다.
- 화면 정의는 route registry가 아니라 activity registry로 관리한다.
- 탭 전환은 `homeMain` activity 내부의 `TabLayout` 상태로 관리한다.
- 상세 화면 진입은 Stackflow `push(activityName, params)`로 처리한다.
- 로그인 성공, 로그아웃, 권한 완료 같은 흐름은 `replace` 또는 reset 성격의 전환으로 처리한다.

예상 구조:

```txt
App
└─ AppProviders
   └─ Stackflow Stack
      ├─ permission
      ├─ login
      ├─ findId
      ├─ findPw
      ├─ homeMain
      │  └─ TabLayout
      │     ├─ Home
      │     ├─ PaymentHistory
      │     ├─ LinkPayment action
      │     ├─ SettlementHistory
      │     └─ Menu
      ├─ invoice
      ├─ makeLink
      ├─ cardScan
      ├─ settlementCalendar
      ├─ setting
      └─ webview
```

## 내비게이션 어댑터 목표

화면 코드가 Stackflow API에 직접 묶이지 않도록 React Native와 유사한 어댑터를 둔다.

```ts
navigation.navigate('invoice', { id });
navigation.replace('homeMain');
navigation.goBack();
```

이 방식은 기존 RN 코드의 이동 패턴을 덜 깨뜨리고, 추후 딥링크/푸시 진입 처리도 중앙화하기 좋다.

## 사용할 주요 라이브러리

### Capacitor

- React 앱을 iOS/Android WebView 앱으로 감싼다.
- 공식 플러그인으로 App, Device, Network, Preferences, Push Notifications, Splash Screen, Camera를 우선 사용한다.
- 카드 OCR/키인 결제처럼 기존 RN 네이티브 모듈에 해당하는 기능은 추후 커스텀 Capacitor 플러그인으로 분리 검토한다.

### Stackflow

- React Native의 stack screen 내비게이션과 가장 유사한 구조를 제공한다.
- `navigate(screenName, params)`에 가까운 `push(activityName, params)` 모델을 사용할 수 있다.
- 뒤로가기 시 이전 activity를 보존하는 모바일 앱식 UX에 유리하다.
- PayKing의 결제현황, 정산, 상품목록, 현금영수증 같은 리스트/상세 왕복 흐름에 적합하다.

### Radix UI

- 완성형 디자인 시스템이 아니라 접근성 좋은 headless primitive로 사용한다.
- Dialog, AlertDialog, Tabs, Slot을 우선 사용한다.
- PayKing의 `PKButton`, `PKInput`, `PKConfirm`, `BottomModal` 같은 자체 컴포넌트 구조를 웹용으로 재구성할 때 기반 primitive로 활용한다.

### Tailwind CSS

- PayKing 디자인 토큰을 빠르게 적용하기 위한 스타일링 기반으로 사용한다.
- 기존 색상 체계인 `#145ED9`, `#E22C17`, 그레이 스케일, S-CoreDream 폰트 계열을 디자인 토큰으로 정리한다.
- 화면 구현 단계에서는 inline style을 줄이고 공통 컴포넌트 중심으로 스타일을 재사용한다.

## 디자인 이식 원칙

- 새 앱의 디자인은 기존 `payking-app`을 최대한 따른다.
- 색상, 타이포그래피, 여백, 버튼 높이, 입력창 형태, 하단 탭, 헤더, 모달 표현은 기존 React Native 화면을 기준으로 웹 컴포넌트에 맞게 재구성한다.
- Vite 기본 샘플 UI나 웹사이트형 랜딩 구성은 사용하지 않는다.
- 모바일 앱 WebView 환경을 우선 기준으로 삼고, 데스크톱 브라우저는 개발 확인용 뷰포트로 취급한다.

## React Native 컴포넌트 웹 이식 전략

개발에 앞서 기존 React Native 주요 컴포넌트를 웹용 공통 컴포넌트로 먼저 분리한다. 화면을 곧바로 포팅하면 `View`, `Text`, `StyleSheet`, `SafeAreaView`, RN 전용 이벤트와 웹 DOM의 차이가 화면마다 반복되므로, 공통 컴포넌트 계층을 먼저 잡는 편이 유지보수에 유리하다.

우선 이식 대상:

- `PKContainer` -> safe-area, fixed bottom action, content padding을 담당하는 `AppContainer`
- `PKText` -> PayKing 폰트/색상/크기 토큰을 적용하는 `PKText`
- `PKButton` -> primary, secondary, disabled, text button 형태를 지원하는 `PKButton`
- `PKInput` -> id/password/phone 등 입력 타입과 에러/비활성 상태를 지원하는 `PKInput`
- `Calculator` -> 결제 금액 사칙연산 입력을 담당하는 `PKCalculator`
- `PKAlert`, `PKConfirm` -> Radix AlertDialog 기반 모달 컴포넌트
- `BottomModal` -> Radix Dialog 기반 하단 시트
- `PKTab` -> controlled 방식의 상단 탭 UI를 담당하는 `PKTopTab`
- `CustomTabBar` -> PayKing 하단 탭 UI
- header option 계층 -> Stackflow activity title/header 컴포넌트

주의할 점:

- React Native 컴포넌트 이름을 무조건 그대로 복제하기보다, 기존 화면 포팅 비용을 줄이는 범위에서 API를 유사하게 유지한다.
- RN `StyleSheet` 객체를 그대로 가져오지 않고 Tailwind/CSS 변수/컴포넌트 props로 디자인 토큰화한다.
- 네이티브 기능에 묶인 컴포넌트는 UI와 기능 어댑터를 분리한다.
- `PKButton`의 시각 타입은 RN과 동일한 `type` prop을 사용하고, 웹 HTML 타입은 `htmlType`으로 구분한다.

## 초기 구현 원칙

- 화면 정의는 `name`, `component`, `title`, `headerShown`, `auth` 같은 메타를 가진 activity registry로 관리한다.
- 화면 이동은 직접 `push`를 호출하지 않고 navigation adapter를 통한다.
- 딥링크 path는 activity와 별도 매핑 테이블로 관리한다.
- 1차 구현에서는 로그인, 인증 상태 분기, 메인 탭 shell까지만 만든다.
- 빌드, Android/iOS 플랫폼 추가, 네이티브 플러그인 구현은 별도 단계에서 진행한다.

## Activity 스타일 작성 규칙

- 각 screen/activity의 화면 전용 스타일은 Tailwind class로 작성한다.
- Tailwind class 문자열은 `classes` 객체에 모아두고 JSX에서는 `classes.key` 형태로 호출한다.
- `classes` 객체는 activity 파일 하단, component 선언 아래에 위치시킨다.
- 공통 컴포넌트의 재사용 스타일은 `src/styles/components.css`에 둔다.
- activity 파일 안에서 화면 전용 CSS 파일을 새로 만들지 않는다.
- 복잡한 조건부 class는 먼저 명확한 key로 분리하고, JSX 안에 긴 class 문자열을 직접 쓰지 않는다.

## 진행 계획 및 작업 내용

### 1. 앱 골격 생성

- Vite 기본 샘플 UI를 제거한다.
- `AppProviders`를 만들고 전역 provider 진입점을 정리한다.
- Stackflow 설정을 추가한다.
- activity registry를 만들어 화면 정의를 중앙화한다.
- React Native의 `navigation.navigate`, `navigation.replace`, `navigation.goBack`에 가까운 navigation adapter를 만든다.
- 1번 완료 후 남은 작업 범위와 다음 구현 우선순위를 다시 공유한다.

### 2. React Native 주요 공통 컴포넌트 웹 이식

- 기존 `payking-app`의 디자인을 기준으로 웹 공통 컴포넌트를 먼저 만든다.
- `PKContainer` 역할의 `AppContainer`를 만든다.
- `PKText`, `PKButton`, `PKInput`을 만든다.
- `PKAlert`, `PKConfirm`, `BottomModal`을 Radix UI 기반으로 만든다.
- PayKing 하단 탭바와 공통 헤더 컴포넌트를 만든다.
- 색상, 폰트, 여백, 버튼 높이, 입력창 형태를 디자인 토큰으로 정리한다.

### 3. 공통 기반 생성

- `services/axios` 계층을 만든다.
- Zustand 기반 `userStore`, `deviceStore`, `globalStore`의 초기 형태를 만든다.
- Capacitor Preferences 기반 persist 유틸을 만든다.
- Capacitor Device, Network 어댑터를 만든다.
- React Query는 사용하지 않고, API 호출은 service 함수와 store/action 중심으로 처리한다.

### 4. 인증 플로우 구현

- `permission`, `login`, `findId`, `findPw` activity를 만든다.
- 기존 로그인 화면의 레이아웃과 문구를 최대한 유지한다.
- 로그인 API 호출, access token 저장, 인증 상태 분기를 구현한다.
- 로그인 성공 시 `homeMain`으로 진입하게 만든다.

현재 진행 상태:

- `login` activity는 구현되어 있다.
- 로그인 API는 기존 RN 앱과 동일하게 `device-token`, `access-point: APP`, `username`, `password` payload를 보낸다.
- 성공 응답의 token은 `useSessionStore.accessToken`에 저장한다.
- 현재 성공 이동 목적지는 임시 인증 샘플 화면인 `userHome`이다.
- 앱 시작 시 웹/네이티브 디바이스 등록 및 device token 발급을 시도한다.
- 로그인 화면은 device token이 없으면 로그인 버튼을 비활성화하고 재시도를 제공한다.
- `userHome`은 `userService.getMyInfo({})`를 호출해 `authInstance`의 access token 주입과 401 refresh 흐름을 확인하는 인증 API 샘플 역할을 한다.

API 환경:

- `.env`는 Vite 클라이언트 노출 규칙에 따라 `VITE_` prefix를 사용한다.
- `VITE_API_URL`은 axios `baseURL`로 사용한다.
- `src/config/env.ts`에서 base URL trailing slash를 제거한다.
- `VITE_API_URL`이 없으면 개발계 `https://api-dev.pay-king.co.kr`로 fallback한다.

401 처리 방향:

- `authInstance`는 401 + `Expired token`이면 refresh API를 호출하고 원 요청을 재시도한다.
- refresh 응답 token은 `token` 또는 `data.token` 형태를 모두 허용한다.
- refresh 실패 또는 401 + `Block Token`이면 access token을 제거한다.
- access token 제거 후 `AuthRouteGuard`가 인증 화면에서 `login`으로 이동시킨다.

### 5. 메인 탭 shell 구현

- `homeMain` activity 내부에 탭 상태 기반 `TabLayout`을 만든다.
- 홈, 결제현황, 링크/QR 액션, 정산현황, 메뉴 탭 구조를 만든다.
- 기존 `MainTabNavigator`와 `CustomTabBar`의 시각 구조를 최대한 따른다.
- 각 탭 화면은 우선 shell 형태로 만들고, 상세 기능은 이후 단계에서 확장한다.

### 6. 네이티브 기능 매핑

- 카메라, 푸시 알림, 딥링크, WebView, 디바이스 정보, 네트워크 상태를 Capacitor 플러그인 기준으로 매핑한다.
- 카드 OCR/키인 결제처럼 기존 RN 네이티브 모듈에 강하게 묶인 기능은 커스텀 Capacitor 플러그인 후보로 분리한다.
- 기능별 브라우저 개발 가능 범위와 네이티브 앱 확인 필요 범위를 구분한다.

### 7. 결제받기 화면 포팅

- `receivePayment` activity와 홈 결제받기 진입 경로를 추가했다.
- React Native `PKTab`의 디자인을 기준으로 `PKTopTab` 공통 컴포넌트를 추가했다.
- `PKTopTab`은 activity에서 활성 탭을 관리하는 controlled API를 사용한다.
- `금액 입력`, `상품 선택` 탭 shell을 구성했다.
- 탭 패널은 전환 후에도 내부 상태가 유지되도록 mounted 상태를 보존한다.
- `PKCalculator` 공통 컴포넌트를 추가하고 `금액 입력` 탭에 연결했다.
- 결제수단 4개 버튼과 1,000원 최소 결제금액 검증을 연결했다.
- 카톡 링크와 QR 코드는 `linkPayment`로 이동하고, 카드 스캔과 저장 링크는 후속 구현 안내를 표시한다.
- `EnterAmountPanel`, `SelectProductPanel`로 탭 내용을 분리해 activity는 탭 조립만 담당한다.
- 다음 단계에서 상품 조회/선택 기능을 연결한다.
