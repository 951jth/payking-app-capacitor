# PayKing Capacitor React

기존 PayKing React Native 앱을 React + Capacitor 기반으로 재구성하는 프로젝트입니다.

- **앱 ID:** `kr.co.payking.web` (`capacitor.config.ts`)
- **앱 이름:** 페이킹 플러스 Web
- **웹 빌드 출력:** `dist/` (`capacitor.config.ts`의 `webDir`)
- **패키지 매니저:** Yarn
- **현재 배포 방식:** 오리진 버전 — `dist` 번들을 네이티브 앱에 포함

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

Capacitor 배포는 **오리진 버전(번들 포함)** 과 **웹 분리 버전(원격 URL)** 두 가지로 나뉩니다.  
**명령어가 완전히 같지 않습니다.** 전환 시 반드시 `capacitor.server.ts` 설정을 바꾼 뒤 `yarn cap sync`로 네이티브에 반영해야 합니다.

### 버전별 차이 한눈에 보기

| | 오리진 버전 (현재) | 웹 분리 버전 (추후) |
|---|---|---|
| **설정** (`capacitor.server.ts`) | `CAPACITOR_SERVER_URL = ''` | `CAPACITOR_SERVER_URL = 'https://...'` |
| **웹 로드 위치** | 앱에 포함된 `dist/` 번들 | 원격 서버 URL |
| **웹 반영** | `yarn build && yarn cap sync` | `yarn build` → 서버 배포만 (앱에 번들 복사 안 함) |
| **설정 반영** | `yarn cap sync` | `yarn cap sync` (URL 변경 시 필수) |
| **앱 실행** | `yarn cap run android` | `yarn cap run android` |

> `yarn cap run android`는 같지만, **그 전에 어떤 설정·빌드 단계를 거치느냐**가 다릅니다.  
> 지금은 오리진 버전(`CAPACITOR_SERVER_URL = ''`)으로 동작 중입니다.

---

### 오리진 버전 (현재 기본)

웹 앱을 빌드한 뒤 `dist/`를 네이티브 프로젝트에 복사해 앱 안에서 로드합니다.  
오프라인 동작이 가능하고 스토어 배포에 적합합니다.

**필수 설정** — 아래 값이 비어 있어야 번들 모드입니다. **이 파일을 바꾸지 않으면 웹 분리 버전으로 전환되지 않습니다.**

```typescript
// capacitor.server.ts
export const CAPACITOR_SERVER_URL = '';
```

**일반적인 반영 흐름**

```bash
yarn build && yarn cap sync    # dist를 앱에 복사
yarn cap run android
```

#### 1. 웹 빌드

```bash
yarn build
```

TypeScript 컴파일 + Vite 프로덕션 빌드가 실행되며, 결과물은 `dist/`에 생성됩니다.

#### 2. 네이티브 플랫폼 추가 (최초 1회)

`android` / `ios` 폴더가 없으면 먼저 추가합니다.

```bash
# Android (Windows 가능)
yarn cap add android

# iOS (macOS에서만)
yarn cap add ios
```

#### 3. 웹 빌드물 동기화

코드 또는 Capacitor 플러그인 변경 후 실행합니다.

```bash
yarn build && yarn cap sync
```

`cap sync`는 `dist/` 복사와 Capacitor 플러그인 네이티브 설정 반영을 수행합니다.

#### 4. 네이티브 앱 실행

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

#### Live Reload (개발용)

오리진 버전 개발 중 Vite dev server에 바로 연결할 때:

```bash
yarn dev                      # 터미널 1
yarn cap run android -l --external     # 터미널 2
```

---

### 웹 분리 버전 (추후, 원격 URL 로드)

웹 앱을 CDN·서버 등에 **별도 배포**하고, 네이티브 앱은 해당 URL만 로드하는 방식입니다.  
웹 콘텐츠만 배포하면 앱 재배포 없이 업데이트할 수 있습니다.

> 지금 당장 전환할 필요는 없습니다. 웹 분리가 필요해질 때 아래 순서대로 설정하세요.

**필수 설정** — `capacitor.server.ts`에 배포 URL을 넣습니다. **이 단계 없이는 원격 URL로 전환되지 않습니다.**

```typescript
// capacitor.server.ts
export const CAPACITOR_SERVER_URL = 'https://your-deployed-url.com';

// 로컬 개발 시 (실기기, PC IP 사용)
// export const CAPACITOR_SERVER_URL = 'http://192.168.0.10:5173';
```

**일반적인 반영 흐름**

```bash
yarn build                       # dist/를 서버에 배포
# capacitor.server.ts에 URL 설정
yarn cap sync                    # URL을 네이티브에 반영 (build && sync 아님)
yarn cap run android
```

#### 1. 웹 앱 배포

```bash
yarn build
# dist/ 를 CDN, S3, Nginx, Vercel 등 호스팅 대상에 배포
```

#### 2. `capacitor.server.ts` 수정

위 **필수 설정**과 동일합니다. URL만 바꾸면 됩니다.

#### 3. 네이티브에 설정 반영

```bash
yarn cap sync
yarn cap run android
```

URL 변경 시마다 `yarn cap sync`를 실행해야 네이티브 WebView가 새 URL을 사용합니다.  
오리진 버전으로 되돌릴 때는 `CAPACITOR_SERVER_URL = ''`로 바꾼 뒤 `yarn build && yarn cap sync`를 실행하세요.

#### 참고

| 항목 | 오리진 버전 | 웹 분리 버전 |
|------|-------------|--------------|
| `CAPACITOR_SERVER_URL` | `''` | 배포 URL |
| `yarn build && yarn cap sync` | 필요 | 불필요 (웹은 서버에 배포) |
| 오프라인 | 가능 | 네트워크 필요 |
| 웹 업데이트 | 앱 재배포 | 서버 배포만 |

HTTP 로컬 개발 URL(`http://...`)은 `cleartext`가 자동 허용됩니다. iOS에서 HTTP를 쓸 때는 ATS 예외 설정이 필요할 수 있습니다.

---

## 일상적인 개발 루틴

### 오리진 버전 (현재)

| 목적 | 명령 |
|------|------|
| UI 빠르게 개발 | `yarn dev` |
| 웹 코드 수정 후 | `yarn build && yarn cap sync` → `yarn cap run android` |
| 설정 전환 | `capacitor.server.ts` 수정 → `yarn cap sync` |
| 네이티브 + Vite live reload | `yarn dev` + `yarn cap run android -l --external` |
| Android Studio에서 디버깅 | `yarn cap open android` |
| 린트 검사 | `yarn lint` |

웹 코드만 수정했다면 `yarn build && yarn cap sync` 후 앱을 다시 실행하면 됩니다. 네이티브 코드나 플러그인을 변경했을 때도 `cap sync`가 필요합니다.

### 웹 분리 버전 (추후 전환 시)

| 목적 | 명령 |
|------|------|
| 웹 코드 수정 후 | `yarn build` → 서버 배포 (앱 sync 불필요) |
| 설정·URL 변경 | `capacitor.server.ts` 수정 → `yarn cap sync` |
| 앱 실행 | `yarn cap run android` |

## Windows에서 빠르게 시작 (오리진 버전)

```bash
yarn install
yarn dev                       # 브라우저 개발

# 네이티브 Android 앱까지 실행할 때
yarn cap add android           # 최초 1회
yarn build && yarn cap sync
yarn cap run android           # Android Studio / 에뮬레이터 필요
```

## Yarn scripts

| 스크립트 | 설명 |
|----------|------|
| `yarn dev` | Vite 개발 서버 실행 |
| `yarn build` | TypeScript + Vite 프로덕션 빌드 (`dist/`) |
| `yarn preview` | 빌드 결과물 로컬 미리보기 |
| `yarn lint` | ESLint 검사 |

## Capacitor CLI

| 명령 | 설명 |
|------|------|
| `yarn build && yarn cap sync` | 웹 빌드 후 sync (오리진 버전) |
| `yarn cap sync` | Capacitor 설정·플러그인 동기화 (웹 분리 버전 URL 반영 시) |
| `yarn cap run android` | Android 앱 실행 |
| `yarn cap run android -l --external` | Vite dev server + live reload로 Android 실행 |
| `yarn cap open android` | Android Studio에서 프로젝트 열기 |

그 외 Capacitor 작업은 `yarn cap` CLI로 실행합니다 (`add`, `run ios`, `open ios` 등).

## 의존성 재설치

Windows에서 `EPERM` 오류가 나면 dev 서버·Node 프로세스를 종료한 뒤 아래를 실행하세요.

```bash
rm -rf node_modules
yarn install
```
