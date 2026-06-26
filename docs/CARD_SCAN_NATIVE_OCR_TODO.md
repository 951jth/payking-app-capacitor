# 카드스캔 결제 네이티브 OCR 연동 남은 작업

이 문서는 `payking-capacitor-react`의 카드스캔 결제 페이지와 `payking-app`의 카드 OCR 네이티브 모듈을 이어 붙이기 위한 남은 작업 메모다.

## 기준

- 현재 프로젝트: `C:\Users\DPC\workspace\payking-capacitor-react`
- 원본 React Native 프로젝트: `C:\Users\DPC\workspace\payking-app`
- 대상 화면: 카드스캔 결제 페이지
- 웹 진입점: `src/activities/CardScanActivity.tsx`
- 네이티브 브리지 래퍼: `src/plugins/paykingOcr.ts`
- 사용자가 명시적으로 요청하지 않는 한 빌드 명령은 실행하지 않는다.

## 현재 웹 구현 상태

카드스캔 페이지는 웹/Capacitor 쪽 구조 정리까지 진행되어 있다.

- `receivePayment` 금액 입력 탭의 카드스캔 버튼이 `cardScan` activity로 이동한다.
- `cardScan` activity가 Stackflow에 등록되어 있다.
- 카드사 목록은 서버에서 조회한 뒤 무이자/부분무이자 할부 정보를 붙여 사용한다.
- 카드사 조회/가공은 `useCardScanIssueBanks` 훅으로 분리되어 있다.
- 폼 상태는 `useCardScanForm` 훅으로 분리되어 있다.
- OCR 실행/결제 API 호출/네이티브 이벤트 구독은 `useCardScanOcrPayment` 훅으로 분리되어 있다.
- 결제 요청 payload 생성은 `utils/cardScanPaymentFactory.ts`로 분리되어 있다.
- OCR 진입 전 검증은 `utils/cardScanValidation.ts`로 분리되어 있다.
- `PaykingOcr` Capacitor plugin 타입 래퍼는 만들어져 있지만, Android/iOS 네이티브 구현은 아직 없다.

주요 파일:

- `src/activities/CardScanActivity.tsx`
- `src/features/card-scan/components/CardScanAmountSummary.tsx`
- `src/features/card-scan/components/CardScanPaymentForm.tsx`
- `src/features/card-scan/components/CardScanPaymentSelectors.tsx`
- `src/features/card-scan/hooks/useCardScanForm.ts`
- `src/features/card-scan/hooks/useCardScanIssueBanks.ts`
- `src/features/card-scan/hooks/useCardScanOcrPayment.ts`
- `src/features/card-scan/utils/cardScanPaymentFactory.ts`
- `src/features/card-scan/utils/cardScanValidation.ts`
- `src/features/card-scan/utils/cardScanErrors.ts`
- `src/features/card-scan/constants/cardScanPayment.constants.ts`
- `src/plugins/paykingOcr.ts`
- `src/types/cardScan.ts`

## 현재 OCR 계약

웹에서 기대하는 Capacitor plugin 이름은 `PaykingOcr`이다.

### 웹 -> 네이티브: OCR 화면 열기

```ts
PaykingOcr.presentOCRView({
  issueBankList,
  selectBankCode: formState.selectedBankCode,
  selectQuotaMonths: String(formState.selectedQuotaMonths),
});
```

전달 필드:

- `issueBankList`: 서버 카드사 목록에 카드사별 `installmentMonths`를 붙인 배열
- `selectBankCode`: 웹 카드스캔 폼에서 선택한 카드사 코드. 문자열.
- `selectQuotaMonths`: 웹 카드스캔 폼에서 선택한 할부 개월. 문자열. 일시불은 `"0"`.

원본 Android `OcrParamsUtil.OCRParams` 기준으로 네이티브 파싱 모델은 아래 형태다.

```kt
data class OCRParams(
    val selectQuotaMonths: String? = null,
    val selectBankCode: String? = null,
    val issueBankList: List<IssueBank> = emptyList()
)
```

### 네이티브 -> 웹: 결제 요청 이벤트

네이티브에서 웹으로 올려야 하는 이벤트:

```ts
PaykingOcr.addListener("onPayment", (event) => {
  // event.payFunnel: "SCAN" | "INPUT"
  // event.cardNumber
  // event.expiry: "MM/YY"
  // event.selectBankCode
  // event.selectQuotaMonths
});
```

확정 payload:

```ts
type CardScanPaymentEvent = {
  payFunnel: "SCAN" | "INPUT";
  cardNumber: string;
  expiry: string;
  selectBankCode: string;
  selectQuotaMonths: string;
};
```

원본 Android `NativeEventEmitter.emitOnPayment`는 `selectBankCode`, `selectQuotaMonths`가 없으면 빈 문자열로 올린다. Capacitor 포팅에서도 두 필드는 항상 문자열로 내려보낸다.

이벤트 의미:

- `payFunnel: "SCAN"`: OCR 스캔 결과로 결제. 선택 카드사/할부는 웹에서 OCR 진입 전 선택한 값과 동일하게 전달한다.
- `payFunnel: "INPUT"`: 직접입력 또는 수정 화면에서 결제. 직접입력 화면에서 최종 선택한 카드사/할부 값을 전달한다.

### 웹 -> 네이티브: 결제 결과 회신

웹에서 네이티브로 돌려줘야 하는 결제 결과:

```ts
PaykingOcr.onPaymentsSuccess({
  title: "결제 성공",
  contents: "결제에 성공했습니다.",
});

PaykingOcr.onPaymentsError({
  title: "결제 불가",
  contents: "...",
});
```

카드사 불일치 실패는 원본 RN `CardScanScreen.jsx`와 동일하게 별도 title과 카드사명을 전달한다.

```ts
PaykingOcr.onPaymentsError({
  title: "카드사 불일치",
  selectIssueName: result.selectIssueName,
  checkIssueName: result.checkIssueName,
});
```

원본 Android `NativeViewManagerModule.onPaymentsError`는 title이 `카드사 불일치`이면 아래 문구와 보조 문구를 네이티브 다이얼로그에 조합한다.

- contents: `선택한 카드사와 조회된 카드사가 일치하지 않습니다.\n카드사를 재확인 후 결제해주세요.`
- subContents: `선택한 카드사 : ...\n조회된 카드사 : ...`

## 왜 issueBankList를 네이티브에 넘기는가

원본 앱의 OCR 네이티브 화면은 단순 스캔 화면이 아니다.

- 스캔 결과 확인
- 카드정보 직접 입력
- 카드사 선택
- 할부 선택
- 결제 결과 성공/실패 다이얼로그

이 흐름을 네이티브 화면 안에서 처리한다. 따라서 직접입력/수정 화면에서 사용할 카드사 목록과 카드사별 할부 목록이 필요하다.

현재 웹은 서버에서 `issue-bank/list`, `interest-free/list`를 조회한 뒤 카드사별 `installmentMonths`를 가공해서 `issueBankList`로 들고 있다. 이 목록을 폼 선택 UI와 네이티브 OCR 화면 양쪽에 동일하게 전달한다.

## 원본 Android 참고 파일

원본 위치: `C:\Users\DPC\workspace\payking-app`

- `android/app/src/main/java/com/payking/NativeViewManagerModule.kt`
- `android/app/src/main/java/com/payking/OCRViewActivity.kt`
- `android/app/src/main/java/com/payking/CardInfoUpdateActivity.kt`
- `android/app/src/main/java/com/payking/PaymentCallbackManager.kt`
- `android/app/src/main/java/com/payking/NativeEventEmitter.kt`
- `android/app/src/main/java/com/payking/OCRViewPackage.kt`
- `android/app/src/main/java/com/payking/util/OcrParamsUtil.kt`
- `android/app/src/main/res/layout/activity_ocr.xml`
- `android/app/src/main/res/layout/activity_card_info.xml`
- `android/app/src/main/res/layout/bottom_sheet_dialog.xml`
- `android/app/src/main/res/layout/bottom_sheet_installment.xml`
- `android/app/src/main/res/layout/dialog_custom.xml`
- `android/app/src/main/res/layout/grid_item_layout.xml`
- `android/app/src/main/res/layout/item_installment.xml`
- `android/app/src/main/assets/fonts/S-CoreDream-*.ttf`
- `android/app/libs/android/appguard-0.3.0.aar`

원본 Android 의존성:

- `com.nhncloud.android:nhncloud-creditcard-recognizer:1.12.0`
- `androidx.constraintlayout:constraintlayout`
- `androidx.window:window`
- `androidx.recyclerview:recyclerview`
- `androidx.coordinatorlayout:coordinatorlayout`
- `com.google.android.material:material`
- `com.google.code.gson:gson`
- AppGuard AAR

## 원본 iOS 참고 파일

원본 위치: `C:\Users\DPC\workspace\payking-app`

- `ios/NativeViewManager.swift`
- `ios/NativeViewModule.m`
- `ios/OCRViewController.swift`
- `ios/DirectInputViewController.swift`
- `ios/DTO/CardInssuer.swift`
- `ios/Modal/CardIssuerBottomSheetViewController.swift`
- `ios/Modal/CardIssuerCell.swift`
- `ios/Modal/InstallmentPickerBottomSheetViewController.swift`
- `ios/Extension/*.swift`
- `ios/payking/Images.xcassets/Icon_card_horizontal.imageset`
- `ios/payking/Images.xcassets/Icon_card_vertical_1.imageset`
- `ios/payking/Images.xcassets/Icon_card_vertical_2.imageset`

원본 iOS 의존성:

- `pod 'NHNCloudOCR'`
- 필요 시 AppGuard XCFramework 확인

## 남은 작업 체크리스트

### 1. Capacitor plugin 네이티브 스켈레톤

- Android `PaykingOcrPlugin` 추가
  - 예상 위치: `android/app/src/main/java/kr/co/payking/web/ocr/PaykingOcrPlugin.kt`
  - `@CapacitorPlugin(name = "PaykingOcr")`
  - `presentOCRView`
  - `onPaymentsSuccess`
  - `onPaymentsError`
  - `notifyListeners("onPayment", data)`
- Android `MainActivity.java`에 plugin 등록 방식 확인
  - Capacitor 8 기준 등록 방식 확인 후 적용
- iOS `PaykingOcrPlugin.swift` 추가
  - 예상 위치: `ios/App/App/PaykingOcrPlugin.swift`
  - `CAPPlugin`
  - `presentOCRView`
  - `onPaymentsSuccess`
  - `onPaymentsError`
  - `notifyListeners("onPayment", data: ...)`

### 2. Android OCR 화면 포팅

- 원본 `OCRViewActivity.kt`를 Capacitor 앱 패키지로 이식
  - `com.payking` 의존 제거
  - React Native bridge 의존 제거
  - `NativeEventEmitter.emitOnPayment`를 Capacitor plugin event로 교체
- 원본 `CardInfoUpdateActivity.kt` 이식
  - 직접입력 결제 이벤트를 Capacitor plugin event로 교체
- `PaymentCallbackManager.kt` 이식
  - `onPaymentsSuccess/Error`가 현재 활성 OCR/직접입력 화면에 전달되게 유지
- `OcrParamsUtil.kt` 이식
  - RN `ReadableMap` 관련 코드는 제거 또는 JSON/JSObject 기반으로 변경
- Android layout/drawable/color/font 리소스 복사
- `AndroidManifest.xml`에 OCR/직접입력 Activity 등록
- Android `build.gradle` 의존성 추가
- NHN OCR key 관리 방식 점검
  - 현재 원본은 source hardcoding 상태
  - 추후 환경별 native config로 분리 권장

### 3. iOS OCR 화면 포팅

- `NativeViewManager.swift`를 Capacitor plugin 형태로 변경
  - RN `RCTEventEmitter`, `RCT_EXTERN_MODULE` 제거
  - `bridge?.viewController` 기준으로 full screen OCR 화면 present
- `OCRViewController.swift` 이식
  - `NativeEventEmitter.shared?.sendEvent`를 plugin notify로 교체
- `DirectInputViewController.swift` 이식
  - 직접입력 결제 이벤트를 plugin notify로 교체
- 카드사/할부 DTO와 bottom sheet, extension 파일 이식
- `Podfile`에 `NHNCloudOCR` 추가
- iOS asset/font/AppGuard 필요 여부 확인
- iOS는 Windows에서 빌드 검증 불가

### 4. 웹/네이티브 연결 검증

- 웹에서 `PaykingOcr.presentOCRView` 호출 시 Android OCR 화면이 열리는지 확인
- 선택 카드사/할부가 네이티브 직접입력 화면에 반영되는지 확인
- 스캔 결제 이벤트:
  - `payFunnel: "SCAN"`
  - `cardNumber`
  - `expiry`
- 직접입력 결제 이벤트:
  - `payFunnel: "INPUT"`
  - `cardNumber`
  - `expiry`
  - `selectBankCode`
  - `selectQuotaMonths`
- 결제 성공 시:
  - 웹 API 성공
  - `PaykingOcr.onPaymentsSuccess`
  - 네이티브 성공 다이얼로그 또는 화면 종료
- 결제 실패 시:
  - 웹 API 실패
  - `PaykingOcr.onPaymentsError`
  - 네이티브 실패 다이얼로그
- 카드사 불일치 케이스:
  - 원본 RN `CardScanScreen.jsx`의 `카드사 불일치` 처리와 동일하게 맞출 것

### 5. 웹 카드스캔 페이지 남은 정리

- `CardScanPaymentForm`의 sticky bottom 버튼이 실제 모바일 WebView에서 안전 영역/키보드와 충돌하지 않는지 확인
- `CardScanActivity`에 남은 로딩 UI 위치가 폼 하단 버튼과 겹치지 않는지 확인
- 상품 선택 탭이 구현되면 `selectedGoodsList` 진입 경로로 카드스캔 결제 연결
- 결제 성공 후 현재는 alert confirm에서 `navigation.goBack`을 호출한다.
  - 원본처럼 결제 완료 화면으로 이동할지 정책 결정 필요
- 브라우저 환경에서는 OCR plugin 미구현 안내 alert가 뜨는 현재 fallback 유지 여부 결정

## 검증 명령 메모

사용자가 명시적으로 요청하지 않는 한 빌드는 실행하지 않는다.

정적 확인 우선:

```powershell
cd C:\Users\DPC\workspace\payking-capacitor-react
.\node_modules\.bin\eslint.cmd src\activities\CardScanActivity.tsx src\features\card-scan\components src\features\card-scan\hooks src\features\card-scan\utils src\features\card-scan\constants
git diff --check
git status --short
```

네이티브 구현 이후 권장 검증:

```powershell
cd C:\Users\DPC\workspace\payking-capacitor-react
yarn build
npm.cmd exec cap sync
cd android
.\gradlew.bat assembleDebug
```

## 최근 확인 상태

- 카드스캔 관련 리팩터 후 `eslint` 통과
- `git diff --check` 통과
- 사용자 요청이 없어서 빌드/타입체크/네이티브 빌드는 실행하지 않음
