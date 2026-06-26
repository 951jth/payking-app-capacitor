package kr.co.payking.web.ocr

import kr.co.payking.web.R

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import kr.co.payking.web.ocr.util.OcrParamsUtil
import kr.co.payking.web.ocr.util.OcrParamsUtil.IssueBank
import kr.co.payking.web.ocr.util.OcrParamsUtil.findBankBySelectedCode

/**
 * Created by yang on 2025-07-16.
 */
class CardInfoUpdateActivity : AppCompatActivity() {

    private lateinit var editCard1: EditText
    private lateinit var editCard2: EditText
    private lateinit var editCard3: EditText
    private lateinit var editCard4: EditText
    private lateinit var editExpire: EditText
    private lateinit var txtCompany1: EditText
    private lateinit var txtCompany2: EditText
    private lateinit var btnRetry: Button
    private lateinit var btnPayment: Button
    private lateinit var txtCardNumber: TextView
    private lateinit var txtCardExpire: TextView
    private lateinit var txtCardCompany: TextView
    private lateinit var txtError: TextView
    private lateinit var btnBack: ImageButton
    private lateinit var loadingOverlay: ConstraintLayout

    private var selectBankCode: String? = null
    private var selectQuotaMonths: String? = null

    private var ocrParams: OcrParamsUtil.OCRParams? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, true)
        setContentView(R.layout.activity_card_info)

        val p1 = intent.getStringExtra("param1")
        val p2 = intent.getStringExtra("param2")
        val p3 = intent.getStringExtra("param3")
        val p4 = intent.getStringExtra("param4")
        val p5 = intent.getStringExtra("param5")

        val ocrParamsJson = intent.getStringExtra("ocrParamsJson")
        ocrParams = OcrParamsUtil.parseFromJson(ocrParamsJson)
        selectBankCode = ocrParams?.selectBankCode
        selectQuotaMonths = ocrParams?.selectQuotaMonths


        val customFont = Typeface.createFromAsset(assets, "fonts/S-CoreDream-5Medium.ttf")

        editCard1 = findViewById(R.id.edit_card_1)
        editCard2 = findViewById(R.id.edit_card_2)
        editCard3 = findViewById(R.id.edit_card_3)
        editCard4 = findViewById(R.id.edit_card_4)
        txtCompany1 = findViewById(R.id.txt_company_1)
        txtCompany2 = findViewById(R.id.txt_company_2)
        editExpire = findViewById<EditText>(R.id.edit_expire)
        val container = findViewById<ConstraintLayout>(R.id.expire_container)
        btnRetry = findViewById<Button>(R.id.btn_retry)
        btnPayment = findViewById(R.id.btn_payment)
        txtCardNumber = findViewById(R.id.txt_card_number)
        txtCardExpire = findViewById(R.id.txt_card_expire)
        txtCardCompany = findViewById(R.id.txt_card_company)
        txtError = findViewById(R.id.txt_error)
        btnBack = findViewById(R.id.btn_back)
        loadingOverlay = findViewById(R.id.loading_overlay)

        btnPayment.isEnabled = false


        val selectedBank: OcrParamsUtil.IssueBank? = ocrParams?.findBankBySelectedCode()
        if (selectedBank != null) {
            txtCompany1.setText(selectedBank.name)
        }

        // 개월수 세팅
        if (ocrParams != null && ocrParams!!.selectQuotaMonths != null) {

            val installmentMonths: List<OcrParamsUtil.InstallmentMonth> =
                ocrParams?.issueBankList?.firstOrNull { it.code == selectBankCode }?.installmentMonths
                    ?: emptyList()

            val selectedLabel: String? = installmentMonths.firstOrNull { it.value == ocrParams!!.selectQuotaMonths?.toInt() }?.label

            txtCompany2.setText(selectedLabel)
        }


        editExpire.addTextChangedListener(object : TextWatcher {
            private var isUpdating = false

            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

            override fun afterTextChanged(s: Editable?) {
                if (isUpdating) return

                s?.let {
                    val digits = it.toString().replace("/", "")
                    if (digits.length > 4) return

                    isUpdating = true

                    val formatted = StringBuilder()
                    for ((index, c) in digits.withIndex()) {
                        if (index == 2) formatted.append("/")
                        formatted.append(c)
                    }

                    // 커서 위치 저장
                    val cursorPosition = editExpire.selectionStart
                    editExpire.setText(formatted.toString())

                    // 커서 위치 조정 (슬래시 추가로 오른쪽으로 밀리므로)
                    val newCursorPosition =
                        if (cursorPosition >= 2) cursorPosition + 1 else cursorPosition
                    if (newCursorPosition <= formatted.length) {
                        editExpire.setSelection(newCursorPosition)
                    } else {
                        editExpire.setSelection(formatted.length)
                    }

                    isUpdating = false
                }
            }
        })

        container.setOnClickListener {
            editExpire.requestFocus()
            // 키보드 띄우기
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showSoftInput(editExpire, InputMethodManager.SHOW_IMPLICIT)
        }


        // 카드사 선택
        txtCompany1.setOnClickListener {
            if (ocrParams != null && ocrParams!!.issueBankList.isNotEmpty()) {
                showBottomSheetDialog { selectedValue ->
                    // 사전에 선택된 카드사와 다른 경우 에러문구 표시
                    txtCompany1.setText(selectedValue)
                    validateInputs()
                }
            }

        }

        // 할부 개월 선택
        txtCompany2.setOnClickListener {
            val customFont = Typeface.createFromAsset(assets, "fonts/S-CoreDream-5Medium.ttf")

            val installmentMonths: List<OcrParamsUtil.InstallmentMonth> =
                ocrParams?.issueBankList?.firstOrNull { it.code == selectBankCode }?.installmentMonths
                    ?: emptyList()
            val dialog = InstallmentBottomSheetDialog(customFont, installmentMonths)
            dialog.setOnInstallmentSelectedListener(object :
                InstallmentBottomSheetDialog.OnInstallmentSelectedListener {
                override fun onInstallmentSelected(selectedValue: OcrParamsUtil.InstallmentMonth) {
                    txtCompany2.setText(selectedValue.label)
                    selectQuotaMonths = selectedValue.value.toString()
                    validateInputs()
                }
            })
            dialog.show(supportFragmentManager, "InstallmentBottomSheet")
        }

        btnRetry.setOnClickListener {
            // 다시 스캔 하기
            finish()

        }

        // 결제 하기
        btnPayment.setOnClickListener {
            showLoading()
            sendResultToReact()

        }

        btnBack.setOnClickListener {
            finish()
        }


        // 모든 입력값 감시
        val watcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                validateInputs()
            }

            override fun afterTextChanged(s: Editable?) {}
        }

        editCard1.addTextChangedListener(watcher)
        editCard2.addTextChangedListener(watcher)
        editCard3.addTextChangedListener(watcher)
        editCard4.addTextChangedListener(watcher)
        editExpire.addTextChangedListener(watcher)


        p1?.let { editCard1.setText(it) }
        p2?.let { editCard2.setText(it) }
        p3?.let { editCard3.setText(it) }
        p4?.let { editCard4.setText(it) }
        p5?.let { editExpire.setText(it) }

        editCard1.typeface = customFont
        editCard2.typeface = customFont
        editCard3.typeface = customFont
        editCard4.typeface = customFont
        txtCompany1.typeface = customFont
        txtCompany2.typeface = customFont
        editExpire.typeface = customFont
        btnRetry.typeface = customFont
        btnPayment.typeface = customFont
        txtCardNumber.typeface = customFont
        txtCardExpire.typeface = customFont
        txtCardCompany.typeface = customFont


    }

    private fun showBottomSheetDialog(onItemSelected: (String) -> Unit) {
        val customFont = Typeface.createFromAsset(assets, "fonts/S-CoreDream-5Medium.ttf")
        val dialog = MyBottomSheetDialog(customFont, ocrParams!!.issueBankList)
        dialog.setOnItemSelectedListener(object : MyBottomSheetDialog.OnItemSelectedListener {
            override fun onItemSelected(item: IssueBank) {

                // intent로 넘어온 카드사 와 일치 여부 확인
                if (!ocrParams!!.selectBankCode.equals(item.code)) {
                    // error
                    item.name?.let { onItemSelected(it) }
                    txtError.visibility = View.GONE
                    selectBankCode = item.code
                } else {
                    item.name?.let { onItemSelected(it) }
                    txtError.visibility = View.GONE
                    selectBankCode = item.code
                }
            }
        })
        dialog.show(supportFragmentManager, "MyBottomSheetDialog")
    }


    private fun validateInputs() {
        val isCardValid = editCard1.text.length == 4 &&
                editCard2.text.length == 4 &&
                editCard3.text.length == 4 &&
                editCard4.text.length >= 2

        val expireText = editExpire.text.toString()
        val isExpireValid = expireText.matches(Regex("^\\d{2}/\\d{2}$")) &&
                isValidMonth(expireText.substring(0, 2))

        val isAllFilled = isCardValid &&
                isExpireValid &&
                txtCompany1.text.isNotEmpty() &&
                txtCompany2.text.isNotEmpty()

        if (isAllFilled) {
            btnPayment.isEnabled = true
            btnPayment.setBackgroundResource(R.drawable.rounded_button_blue_bg) // 활성화 색상
            btnPayment.setTextColor(ContextCompat.getColor(this, R.color.color_145ED9))
        } else {
            btnPayment.isEnabled = false
            btnPayment.setBackgroundResource(R.drawable.rounded_button_gray_bg) // 비활성화 색상
            btnPayment.setTextColor(ContextCompat.getColor(this, R.color.color_8B9099))
        }
    }

    // 로딩 시작 시 호출
    private fun showLoading() {
        loadingOverlay.visibility = View.VISIBLE
    }

    // 로딩 완료 시 호출
    private fun hideLoading() {
        loadingOverlay.visibility = View.GONE
    }


    override fun onStart() {
        super.onStart()
        PaymentCallbackManager.register(
            ownerTag = "CARD",
            onSuccess = { title, contents,subContents ->
                runOnUiThread {
                    hideLoading()
                    showCustomDialog(
                        this@CardInfoUpdateActivity,
                        title,
                        contents,
                        subContents,
                        true
                    )
                }
            },
            onError = { title, contents,subContents ->
                runOnUiThread {
                    hideLoading()
                    showCustomDialog(
                        this@CardInfoUpdateActivity,
                        title,
                        contents,
                        subContents,
                        false
                    )
                }
            }
        )
    }

    override fun onStop() {
        super.onStop()
        //  리스너 해제
        PaymentCallbackManager.unregister("CARD")
    }


    /**
     * MM 값이 01~12인지 체크
     */
    private fun isValidMonth(monthStr: String): Boolean {
        return try {
            val month = monthStr.toInt()
            month in 1..12
        } catch (e: NumberFormatException) {
            false
        }
    }

    private fun sendResultToReact() {
        // 카드번호 조립
        val cardNumber = buildString {
            append(editCard1.text.toString().trim() ?: "")
            append(editCard2.text.toString().trim() ?: "")
            append(editCard3.text.toString().trim() ?: "")
            append(editCard4.text.toString().trim() ?: "")
        }

        // 만료일 (editExpire는 "MM/YY" 포맷이라고 가정)
        val expiry = editExpire.text.toString().trim().orEmpty()



        PaykingOcrPlugin.emitOnPayment(
            payFunnel = "INPUT",            // "SCAN" or "INPUT"
            cardNumber = cardNumber,
            expiry = expiry,                  // "MM/YY"
            selectBankCode = selectBankCode,
            selectQuotaMonths = selectQuotaMonths
        )
    }


    private fun showCustomDialog(
        context: Context,
        _title: String,
        _contents: String?,
        _subContents: String?,
        isFlag: Boolean
    ) {
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

        // 카드사 불일치 일때  텍스트 조합


        title.text = _title
        if(!_contents.isNullOrEmpty()) {
            contents.text = _contents
        }
        if(!_subContents.isNullOrEmpty()) {
            subContents.text = _subContents
            subContents.visibility =View.VISIBLE
        }else{
            subContents.visibility =View.GONE
        }
        cancelBtn.visibility = View.GONE


        cancelBtn.setOnClickListener {
            dialog.dismiss()
        }

        confirmBtn.setOnClickListener {

            // 확인 로직
            dialog.dismiss()
            if (isFlag) {
                setResult(Activity.RESULT_OK)
                finish()
            }
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


}

