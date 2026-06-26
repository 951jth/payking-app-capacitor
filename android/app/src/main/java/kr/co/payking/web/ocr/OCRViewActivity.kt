package kr.co.payking.web.ocr

import kr.co.payking.web.R

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.content.res.Resources
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import androidx.window.layout.WindowMetricsCalculator
import com.google.gson.Gson
import com.nhncloud.android.ocr.NhnCloudOcrServices
import com.nhncloud.android.ocr.SecureTextView
import com.nhncloud.android.ocr.creditcard.CreditCardRecognitionData
import com.nhncloud.android.ocr.creditcard.CreditCardRecognitionService
import com.nhncloud.android.ocr.creditcard.CreditCardScanOrientation
import com.nhncloud.android.ocr.creditcard.view.CreditCardRecognitionCameraPreview
import com.nhncloud.android.ocr.security.Secures
import kr.co.payking.web.ocr.util.OcrParamsUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.io.IOException


class OCRViewActivity : AppCompatActivity() {

    private var ocrParams: OcrParamsUtil.OCRParams? = null
    private var selectBankCodeParam: String? =null
    private var selectQuotaMonthsParam: String? =null

    var isVerticalFlag = false

    companion object {
        const val APP_KEY = "D6fq8teCTan5vDJ9"
        const val SECRET_KEY = "MbARqi9NN6ZjRMK9NGOUyICcKadVfGQj"
    }

    private lateinit var service: CreditCardRecognitionService

    private  var scanCard1: String? = null
    private  var scanCard2: String? = null
    private  var scanCard3: String? = null
    private  var scanCard4: String? = null
    private  var scanExpire: String? =null

    private lateinit var loadingOverlay: ConstraintLayout


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, true)



        setContentView(R.layout.activity_ocr)



        // 상단에 가짜 status bar 배경 뷰를 동적으로 추가
        val statusBarView = View(this).apply {
            setBackgroundColor(ContextCompat.getColor(this@OCRViewActivity, R.color.transparent))
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                getStatusBarHeight(this@OCRViewActivity)
            ).apply {
                gravity = Gravity.TOP
            }
        }

        val rootView = findViewById<ViewGroup>(android.R.id.content)
        (rootView as ViewGroup).addView(statusBarView)

//        ViewCompat.setOnApplyWindowInsetsListener(window.decorView) { _, insets ->
//            val statusBarHeight = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
//            findViewById<View>(R.id.root_layout).setPadding(0, statusBarHeight, 0, 0)
//            insets
//        }


        val json = intent.getStringExtra("ocrParamsJson")
        ocrParams = OcrParamsUtil.parseFromJson(json)        
        // 카드사 정보
        selectBankCodeParam= intent.getStringExtra("selectBankCode").orEmpty()
        // 할부 개월
        selectQuotaMonthsParam = intent.getStringExtra("selectQuotaMonths").orEmpty()


        // 디버깅
        Log.d("OCRViewActivity", "Raw JSON:\n${OcrParamsUtil.prettyPrint(json)}")
        Log.d("OCRViewActivity", "Selected bank code: ${ocrParams?.selectBankCode}")
        Log.d("OCRViewActivity", "Bank count: ${ocrParams?.issueBankList?.size}")

        val customFont = Typeface.createFromAsset(assets, "fonts/S-CoreDream-5Medium.ttf")

        val scanContainer = findViewById<ConstraintLayout>(R.id.content_container)
        val resultContainer = findViewById<ConstraintLayout>(R.id.content_container_result)
        val cardNumber1 = findViewById<SecureTextView>(R.id.txt_number1)
        val cardNumber2 = findViewById<SecureTextView>(R.id.txt_number2)
        val cardNumber3 = findViewById<SecureTextView>(R.id.txt_number3)
        val cardNumber4 = findViewById<SecureTextView>(R.id.txt_number4)
        val cardExpire = findViewById<SecureTextView>(R.id.txt_expire)

        cardNumber1.setTextSize(16f)
        cardNumber2.setTextSize(16f)
        cardNumber3.setTextSize(16f)
        cardNumber4.setTextSize(16f)
        cardExpire.setTextSize(16f)

        cardNumber1.setTextColor(ContextCompat.getColor(this, R.color.color_E7E9EE))
        cardNumber2.setTextColor(ContextCompat.getColor(this, R.color.color_E7E9EE))
        cardNumber3.setTextColor(ContextCompat.getColor(this, R.color.color_E7E9EE))
        cardNumber4.setTextColor(ContextCompat.getColor(this, R.color.color_E7E9EE))
        cardExpire.setTextColor(ContextCompat.getColor(this, R.color.color_E7E9EE))


        val titleText = findViewById<TextView>(R.id.title_text)
        val syncText = findViewById<TextView>(R.id.sync_text)
        val scanHorGuide = findViewById<TextView>(R.id.scan_hor_guide)
        val scanVerGuide = findViewById<TextView>(R.id.scan_ver_guide)
        val guideText = findViewById<TextView>(R.id.guide_text)
        val btnVerHor = findViewById<Button>(R.id.btn_ver_hor)
        val btnDirect = findViewById<Button>(R.id.btn_direct)
        val txtCheck = findViewById<TextView>(R.id.txt_check)
        val txtExpireTitle = findViewById<TextView>(R.id.txt_expire_title)
        val footerTitle = findViewById<TextView>(R.id.footer_title)
        val btnRetry = findViewById<Button>(R.id.btn_retry)
        val txtUpdate = findViewById<TextView>(R.id.txt_update)
        val txtPayment = findViewById<TextView>(R.id.txt_payment)
        val btnBack = findViewById<ImageButton>(R.id.btn_back)
        loadingOverlay = findViewById(R.id.loading_overlay)



        ////
        // WindowInsets 처리
        val fakeStatusBar = findViewById<View>(R.id.fake_status_bar)
        ViewCompat.setOnApplyWindowInsetsListener(fakeStatusBar) { view, insets ->
            val statusBarHeight = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            val layoutParams = view.layoutParams
            layoutParams.height = statusBarHeight
            view.layoutParams = layoutParams
            view.visibility = View.VISIBLE
            insets
        }

        ////



        titleText.typeface = customFont
        btnVerHor.typeface = customFont
        syncText.typeface = customFont
        scanHorGuide.typeface = customFont
        scanVerGuide.typeface = customFont
        guideText.typeface = customFont
        btnDirect.typeface = customFont
        txtCheck.typeface = customFont
        txtExpireTitle.typeface = customFont
        footerTitle.typeface = customFont
        btnRetry.typeface = customFont
        txtUpdate.typeface = customFont
        txtPayment.typeface = customFont


        // 카드 인식 서비스 초기화
        service = NhnCloudOcrServices.newBuilder(this)
            .appKey(APP_KEY)
            .secretKey(SECRET_KEY)
            .build()
            .createCreditCardRecognitionService()

        // 리스너 설정
        service.setCreditCardRecognitionListener { result, data ->
            if (result.isSuccess) {

                val cardNumbers = data?.cardNumbers
                val firstNumber = cardNumbers?.getOrNull(0)?.value
                val Number2 = cardNumbers?.getOrNull(1)?.value
                val Number3 = cardNumbers?.getOrNull(2)?.value
                val Number4 = cardNumbers?.getOrNull(3)?.value
                val expireDate = data?.expirationDate?.value




                scanCard1 = null
                scanCard2 = null
                scanCard3 = null
                scanCard4 = null
                scanExpire = null

                scanCard1 = firstNumber?.let { Secures.asString(it) }
                scanCard2 = Number2?.let { Secures.asString(it) }
                scanCard3 = Number3?.let { Secures.asString(it) }
                scanCard4 = Number4?.let { Secures.asString(it) }
                scanExpire = expireDate?.let { Secures.asString(it) }


                val isCardValid = isFourDigits(scanCard1) &&
                        isFourDigits(scanCard2) &&
                        isFourDigits(scanCard3) &&
                        isTwoDigits(scanCard4)

                val normalizedExpire = normalizeExpiry(scanExpire)
                val isExpireValid = normalizedExpire != null
                if (!isCardValid || !isExpireValid) {
                    // 재 스캔 필요
                }else{
                    // 정상 스캔
                    // 카드 번호 표시 하기
                    service.stop()
                    scanContainer.visibility = View.GONE
                    resultContainer.visibility = View.VISIBLE
                    cardNumber1.setText(firstNumber)
                    cardNumber2.setText(Number2)
                    cardNumber3.setText(Number3)
                    cardNumber4.setText(Number4)
                    cardExpire.setText(expireDate)
                }




            } else {

            }
        }

        val cameraPreview = findViewById<CreditCardRecognitionCameraPreview>(R.id.camera_preview)
        lifecycleScope.launch {
            val isZFold = isZFoldStyleDevice(this@OCRViewActivity)
            Log.d("OCRViewActivity", "isZFold :$isZFold ")
            if (isZFold) {
                val paddingPx = (20 * resources.displayMetrics.density).toInt()
                cameraPreview.setPadding(paddingPx, 0, paddingPx, 0)
            } else {
                val paddingPx40 = (10 * resources.displayMetrics.density).toInt()
                val paddingPx80 = (10 * resources.displayMetrics.density).toInt()
                cameraPreview.setPadding(0, 0, 0, 0)
                // 현재 LayoutParams 가져오기
                val rawParams = guideText.layoutParams

                    // MarginLayoutParams로 안전하게 캐스팅
                if (rawParams is ViewGroup.MarginLayoutParams) {
                    rawParams.topMargin = paddingPx40
                    rawParams.bottomMargin = paddingPx80
                    guideText.layoutParams = rawParams
                }
            }
        }

      //  showCustomDialog(this)

try{
       // service.start(cameraPreview)
} catch (e: IOException) {
    // Camera is not available (in use or does not exist)
    Log.d("YANG", "yang priview error e : " +e.message)}


        btnVerHor.setOnClickListener {
            if (isVerticalFlag) {
                service.scanOrientation = CreditCardScanOrientation.HORIZONTAL
                isVerticalFlag = false
            } else {
                service.scanOrientation = CreditCardScanOrientation.VERTICAL
                isVerticalFlag = true
            }
        }

        // 카드 정보 직접 입력 하기
        btnDirect.setOnClickListener {
            val ocrParamsJson = Gson().toJson(ocrParams)

            val intent = Intent(this, CardInfoUpdateActivity::class.java).apply {
                putExtra("ocrParamsJson", ocrParamsJson)
            }
            //startActivity(intent)
            launcher.launch(intent)

        }

        // 다시 스캔 하기
        btnRetry.setOnClickListener {
           // service.start(cameraPreview)
           // service.start(findViewById<CreditCardRecognitionCameraPreview>(R.id.camera_preview))

//            scanContainer.visibility = View.VISIBLE
//            resultContainer.visibility = View.GONE
//            cardNumber1.setText(null)
//            cardNumber2.setText(null)
//            cardNumber3.setText(null)
//            cardNumber4.setText(null)
//            cardExpire.setText(null)
//            scanCard1 = null
//            scanCard2 = null
//            scanCard3 = null
//            scanCard4 = null
//            scanExpire = null


            val ocrParamsJson = Gson().toJson(ocrParams)

            val intent = Intent(this, OCRViewActivity::class.java).apply {
                putExtra("ocrParamsJson", ocrParamsJson)
                putExtra("selectBankCode", selectBankCodeParam)
                putExtra("selectQuotaMonths", selectQuotaMonthsParam)
            }

            startActivity(intent)
            finish()

            // 화면 전환 애니메이션 제거 (자연스럽게)
            overridePendingTransition(0, 0)

        }

        // 수정하기
        txtUpdate.setOnClickListener {
            val ocrParamsJson = Gson().toJson(ocrParams)
            val intent = Intent(this, CardInfoUpdateActivity::class.java).apply {
                putExtra("param1", scanCard1)
                putExtra("param2", scanCard2)
                putExtra("param3", scanCard3)
                putExtra("param4", scanCard4)
                putExtra("param5", scanExpire)
                putExtra("ocrParamsJson", ocrParamsJson)
            }
            startActivity(intent)
            finish()
        }

        // 결제 하기
        txtPayment.setOnClickListener {
            showLoading()
            sendResultToReact()
        }

        btnBack.setOnClickListener {
            finish()
        }
    }



    private fun initService() {
        val cameraPreview = findViewById<CreditCardRecognitionCameraPreview>(R.id.camera_preview)
        val scanContainer = findViewById<ConstraintLayout>(R.id.content_container)
        val resultContainer = findViewById<ConstraintLayout>(R.id.content_container_result)
        val cardNumber1 = findViewById<SecureTextView>(R.id.txt_number1)
        val cardNumber2 = findViewById<SecureTextView>(R.id.txt_number2)
        val cardNumber3 = findViewById<SecureTextView>(R.id.txt_number3)
        val cardNumber4 = findViewById<SecureTextView>(R.id.txt_number4)
        val cardExpire = findViewById<SecureTextView>(R.id.txt_expire)

        // 1. 기존 서비스 완전 해제
        try { service.stop() } catch (e: Exception) { Log.e("OCRViewActivity", "stop error: ${e.message}") }
        try { service.release() } catch (e: Exception) { Log.e("OCRViewActivity", "release error: ${e.message}") }

        // 2. 서비스 재생성
        service = NhnCloudOcrServices.newBuilder(this)
            .appKey(APP_KEY)
            .secretKey(SECRET_KEY)
            .build()
            .createCreditCardRecognitionService()

        // 3. 리스너 재등록
        service.setCreditCardRecognitionListener { result, data ->
            if (result.isSuccess) {
                val cardNumbers = data?.cardNumbers
                val firstNumber = cardNumbers?.getOrNull(0)?.value
                val number2 = cardNumbers?.getOrNull(1)?.value
                val number3 = cardNumbers?.getOrNull(2)?.value
                val number4 = cardNumbers?.getOrNull(3)?.value
                val expireDate = data?.expirationDate?.value

                scanCard1 = firstNumber?.let { Secures.asString(it) }
                scanCard2 = number2?.let { Secures.asString(it) }
                scanCard3 = number3?.let { Secures.asString(it) }
                scanCard4 = number4?.let { Secures.asString(it) }
                scanExpire = expireDate?.let { Secures.asString(it) }

                val isCardValid = isFourDigits(scanCard1) &&
                        isFourDigits(scanCard2) &&
                        isFourDigits(scanCard3) &&
                        isTwoDigits(scanCard4)

                val isExpireValid = normalizeExpiry(scanExpire) != null

                if (isCardValid && isExpireValid) {
                    service.stop()
                    scanContainer.visibility = View.GONE
                    resultContainer.visibility = View.VISIBLE
                    cardNumber1.setText(firstNumber)
                    cardNumber2.setText(number2)
                    cardNumber3.setText(number3)
                    cardNumber4.setText(number4)
                    cardExpire.setText(expireDate)
                }
            }
        }

        // 4. 딜레이 후 카메라 시작
        cameraPreview.postDelayed({
            try {
                service.start(cameraPreview)
                Log.d("OCRViewActivity", "service restarted successfully")
            } catch (e: Exception) {
                Log.e("OCRViewActivity", "service start error: ${e.message}")
            }
        }, 300L)
    }
    private val launcher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            finish()  // OK로 돌아오면 종료
        }
    }

    private fun isConfident(data: CreditCardRecognitionData): Boolean {
        return true // 추가 정확도 체크 가능
    }

    // 로딩 시작 시 호출
    private fun showLoading() {
        loadingOverlay.visibility = View.VISIBLE
    }

    // 로딩 완료 시 호출
    private fun hideLoading() {
        loadingOverlay.visibility = View.GONE
    }

    override fun onResume() {
        super.onResume()
        service.start(findViewById<CreditCardRecognitionCameraPreview>(R.id.camera_preview))
        Log.d("retry", "onResume")


        // Rn 이벤트 리스너
//        PaymentCallbackManager.onSuccess = { title, contents ->
//            runOnUiThread {
//                showCustomDialog(this@OCRViewActivity,title, contents, true)
//            }
//        }
//
//        PaymentCallbackManager.onError = { title, contents ->
//            runOnUiThread {
//                showCustomDialog(this@OCRViewActivity,title, contents, false)
//            }
//        }
    }

    override fun onStart() {
        super.onStart()
        PaymentCallbackManager.register(
            ownerTag = "OCR",
            onSuccess = { title, contents, subContents ->
                runOnUiThread { hideLoading()
                    showCustomDialog(this@OCRViewActivity, title, contents, subContents, true) }
            },
            onError = { title, contents, subContents ->
                runOnUiThread { hideLoading()
                    showCustomDialog(this@OCRViewActivity, title, contents, subContents, false) }
            }
        )
    }

    override fun onPause() {
        super.onPause()
        service.stop()
    }

    override fun onStop() {
        super.onStop()
        PaymentCallbackManager.unregister("OCR")
    }


    override fun onDestroy() {
        super.onDestroy()
        service.release()

    }



    // dp 값을 px로 변환 (툴바 fallback 높이 지정 시 사용)
    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }


    fun isLikelyZFoldDevice(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val metrics = WindowMetricsCalculator.getOrCreate().computeCurrentWindowMetrics(context)
            val bounds = metrics.bounds
            val width = bounds.width()
            val height = bounds.height()
            val density = context.resources.displayMetrics.density

            val widthDp = width / density
            val heightDp = height / density
            val aspectRatio = widthDp / heightDp

            // Z Fold 펼침 상태: 넓은 가로폭 + 가로 형태
            return widthDp >= 660 && aspectRatio > 1.05
        }
        return false
    }

    suspend fun isZFoldStyleDevice(activity: AppCompatActivity): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return false

        return withContext(Dispatchers.Default) {
            val layoutInfo = withTimeoutOrNull(500L) {
                WindowInfoTracker.getOrCreate(activity)
                    .windowLayoutInfo(activity)
                    .first()
            } ?: return@withContext false

            val foldingFeature = layoutInfo.displayFeatures
                .filterIsInstance<FoldingFeature>()
                .firstOrNull()

            // 접힘 방향 판단: 힌지가 좌우면 Z Fold 가능성
            val isHorizontalFold =
                (foldingFeature?.bounds?.width() ?: 0) > (foldingFeature?.bounds?.height() ?: 0)
            val isFlat = foldingFeature?.state == FoldingFeature.State.FLAT

            // 화면 크기 및 비율 측정
            val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val bounds = wm.currentWindowMetrics.bounds

            val density = Resources.getSystem().displayMetrics.density
            val screenWidthDp = bounds.width() / density
            val screenHeightDp = bounds.height() / density
            val aspectRatio = screenWidthDp / screenHeightDp

            // Z Fold 스타일: 접힘 존재 + 좌우 접힘 + aspectRatio 대략 0.8~1.3 사이
            foldingFeature != null && isFlat && aspectRatio >= 0.7
        }
    }


    private fun showCustomDialog(context: Context, _title: String, _contents: String, _subContents: String?, isFlag:Boolean) {
        val dialog = Dialog(context)
        dialog.setContentView(R.layout.dialog_custom)

        // dim 처리 자동됨, 필요시 스타일 추가 설정 가능
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))

        // 클릭 이벤트 연결
        val title = dialog.findViewById<TextView>(R.id.dialog_title)
        val contents = dialog.findViewById<TextView>(R.id.dialog_message)
        val subContents = dialog.findViewById<TextView>(R.id.dialog_sub_message)
        val cancelBtn = dialog.findViewById<Button>(R.id.btn_close)
        val confirmBtn = dialog.findViewById<Button>(R.id.btn_confirm)

        title.text = _title
        contents.text = _contents

        if(!_subContents.isNullOrEmpty()) {
            subContents.text = _subContents
            subContents.visibility =View.VISIBLE
        }else{
            subContents.visibility =View.GONE
        }
        cancelBtn.visibility= View.GONE

        cancelBtn.setOnClickListener {
            dialog.dismiss()
        }

        confirmBtn.setOnClickListener {
            // 확인 로직
            dialog.dismiss()

            if(isFlag) finish()
        }
        dialog.show()

        // **여기서 다이얼로그 width를 MATCH_PARENT로 변경**
        dialog.window?.setLayout(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        // **좌우 padding을 20dp로 추가**
        val marginInPx = (20 * context.resources.displayMetrics.density).toInt()
        dialog.window?.decorView?.setPadding(marginInPx, 0, marginInPx, 0)
    }


    private fun sendResultToReact() {


        // 카드번호 조립
        val cardNumber = buildString {
            append(scanCard1.toString().trim() ?: "")
            append(scanCard2.toString().trim() ?: "")
            append(scanCard3.toString().trim() ?: "")
            append(scanCard4.toString().trim() ?: "")
        }

        // 만료일 (editExpire는 "MM/YY" 포맷이라고 가정)
        val expiry = scanExpire.toString().trim().orEmpty()

        // 선택된 은행코드: ocrParams 기반 ≫ UI 기반 fallback
        val bankCode: String = intent.getStringExtra("selectBankCode").orEmpty()

        // 할부 개월
        val quotaStr: String = intent.getStringExtra("selectQuotaMonths").orEmpty()

        Log.d("OCRViewActivity", "Emitting onPayment: card=$cardNumber exp=$expiry bank=$bankCode quota=$quotaStr ")

        // JS 이벤트 발사
        PaykingOcrPlugin.emitOnPayment(
            payFunnel = "SCAN",            // "SCAN" or "INPUT"
            cardNumber = cardNumber,
            expiry = expiry,                  // "MM/YY"
            selectBankCode = bankCode,
            selectQuotaMonths = quotaStr
        )
    }

    private val EXPIRY_REGEX = Regex("^(0[1-9]|1[0-2])/[0-9]{2}$")

    private fun isFourDigits(s: String?): Boolean =
        !s.isNullOrBlank() && s.length == 4 && s.all { it.isDigit() }

    private fun isTwoDigits(s: String?): Boolean =
        !s.isNullOrBlank() && s.length >= 2 && s.all { it.isDigit() }

    /**
     * 스캐너가 "MMYY" 또는 "MM/YY" 등으로 줄 수 있으므로 정규화.
     * 성공 시 "MM/YY" 리턴, 실패 시 null.
     */
    private fun normalizeExpiry(raw: String?): String? {
        if (raw.isNullOrBlank()) return null
        val digits = raw.filter { it.isDigit() }
        if (digits.length < 4) return null
        val mm = digits.substring(0, 2)
        val yy = digits.substring(2, 4)
        val formatted = "$mm/$yy"
        return if (EXPIRY_REGEX.matches(formatted)) formatted else null
    }


    fun getStatusBarHeight(context: Context): Int {
        val resourceId = context.resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (resourceId > 0) context.resources.getDimensionPixelSize(resourceId) else 0
    }










}



