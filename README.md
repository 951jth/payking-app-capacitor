# PayKing Capacitor React

기존 PayKing React Native 앱을 React + Capacitor 기반으로 재구성하는 프로젝트입니다.

- **앱 ID:** `kr.co.payking.app`
- **앱 이름:** PayKing
- **웹 빌드 출력:** `dist/` (`capacitor.config.ts`의 `webDir`)
- **패키지 매니저:** Yarn

아키텍처·라우팅 방향 등 상세 설계는 [`docs/PAYKING_APP_REBUILD_NOTES.md`](docs/PAYKING_APP_REBUILD_NOTES.md)를 참고하세요.

## 기술 스택

- React 19 + TypeScript + Vite
- Capacitor 8 (App, Device, Network, Preferences, Push Notifications, Splash Screen, Camera)
- Stackflow (화면 스택 내비게이션)
- Zustand, Axios, Tailwind CSS

> `@tanstack/react-query`는 1차 재구성 범위에서 제외합니다. 서버 상태는 우선 Zustand store, service 함수, 화면 단위 async 처리로 구성합니다.

## 사전 준비

```bash
cd payking-capacitor-react
yarn install
```

### Android 네이티브 빌드/실행 (Windows 가능)

- [Android Studio](https://developer.android.com/studio) + Android SDK
- JDK 17 (Android Studio에 포함되는 경우가 많음)
- 에뮬레이터 또는 USB 디버깅 가능한 실기기

### iOS

- macOS + Xcode 필요 (Windows에서는 iOS 빌드/실행 불가)

## 웹 개발 서버로 시작

UI·로직 개발은 브라우저에서 먼저 진행하는 것을 권장합니다.

```bash
yarn dev
```

Vite 개발 서버가 실행됩니다 (기본: `http://localhost:5173`). HMR(핫 리로드)을 지원합니다.

> Capacitor 네이티브 기능(카메라, 푸시 알림 등)은 브라우저에서 제한될 수 있습니다.

빌드 결과물만 확인할 때:

```bash
yarn build
yarn preview
```

## Capacitor 앱 빌드 및 실행

Capacitor는 **웹 앱을 빌드한 뒤 `dist`를 네이티브 프로젝트에 복사**하는 방식으로 동작합니다.

### 1. 웹 빌드

```bash
yarn build
```

TypeScript 컴파일 + Vite 프로덕션 빌드가 실행되며, 결과물은 `dist/`에 생성됩니다.

### 2. 네이티브 플랫폼 추가 (최초 1회)

`android` / `ios` 폴더가 없으면 먼저 추가합니다.

```bash
# Android (Windows 가능)
yarn cap add android

# iOS (macOS에서만)
yarn cap add ios
```

### 3. 웹 빌드물 동기화

코드 또는 Capacitor 플러그인 변경 후 실행합니다.

```bash
yarn build
yarn cap sync
```

`cap sync`는 `dist` 복사와 Capacitor 플러그인 네이티브 설정 반영을 수행합니다.

### 4. 네이티브 앱 실행

**Android**

```bash
# 에뮬레이터/연결된 기기에 바로 실행
yarn cap run android

# Android Studio에서 열기
yarn cap open android
```

Android Studio에서 Run(▶) 버튼으로도 실행할 수 있습니다.

**iOS (macOS)**

```bash
yarn cap run ios
# 또는
yarn cap open ios
```

## 일상적인 개발 루틴

| 목적 | 명령 |
|------|------|
| UI 빠르게 개발 | `yarn dev` |
| 네이티브 앱에 반영 | `yarn build` → `yarn cap sync` → `yarn cap run android` |
| Android Studio에서 디버깅 | `yarn cap open android` |
| 린트 검사 | `yarn lint` |

웹 코드만 수정했다면 `yarn build && yarn cap sync` 후 앱을 다시 실행하면 됩니다. 네이티브 코드나 플러그인을 변경했을 때도 `cap sync`가 필요합니다.

## Windows에서 빠르게 시작

```bash
yarn install
yarn dev                       # 브라우저 개발

# 네이티브 Android 앱까지 실행할 때
yarn build
yarn cap add android           # 최초 1회
yarn cap sync
yarn cap run android           # Android Studio / 에뮬레이터 필요
```

## Yarn scripts

| 스크립트 | 설명 |
|----------|------|
| `yarn dev` | Vite 개발 서버 실행 |
| `yarn build` | TypeScript + Vite 프로덕션 빌드 (`dist/`) |
| `yarn preview` | 빌드 결과물 로컬 미리보기 |
| `yarn lint` | ESLint 검사 |

Capacitor 관련 작업은 `yarn cap` CLI로 실행합니다 (`sync`, `run`, `open`, `add` 등).

## 의존성 재설치

Windows에서 `EPERM` 오류가 나면 dev 서버·Node 프로세스를 종료한 뒤 아래를 실행하세요.

```bash
rm -rf node_modules
yarn install
```
