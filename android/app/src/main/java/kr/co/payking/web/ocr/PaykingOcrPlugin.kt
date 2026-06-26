package kr.co.payking.web.ocr

import android.content.Intent
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.lang.ref.WeakReference

@CapacitorPlugin(name = "PaykingOcr")
class PaykingOcrPlugin : Plugin() {
    private var pendingPaymentResult: PaymentResult? = null

    override fun load() {
        activePlugin = WeakReference(this)
    }

    override fun handleOnDestroy() {
        if (activePlugin.get() === this) {
            activePlugin.clear()
        }
    }

    @PluginMethod
    fun presentOCRView(call: PluginCall) {
        val issueBankList = call.getArray("issueBankList")
        val selectBankCode = call.getString("selectBankCode", "").orEmpty()
        val selectQuotaMonths = call.getString("selectQuotaMonths", "").orEmpty()

        if (issueBankList == null) {
            call.reject("issueBankList is required.")
            return
        }

        Log.d(
            TAG,
            "presentOCRView called. bankCount=${issueBankList.length()}, " +
                "selectBankCode=$selectBankCode, selectQuotaMonths=$selectQuotaMonths",
        )

        val intent = Intent(activity, OCRViewActivity::class.java).apply {
            putExtra("ocrParamsJson", call.data.toString())
            putExtra("selectBankCode", selectBankCode)
            putExtra("selectQuotaMonths", selectQuotaMonths)
        }
        activity.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun onPaymentsSuccess(call: PluginCall) {
        pendingPaymentResult = PaymentResult.fromCall(call)
        Log.d(TAG, "Payment success: ${pendingPaymentResult?.title.orEmpty()}")
        pendingPaymentResult?.let { result ->
            val contents = result.selectIssueName.ifBlank { result.contents }
            val subContents = result.checkIssueName.ifBlank { result.subContents }
            PaymentCallbackManager.fireSuccess(result.title, contents, subContents)
        }
        call.resolve()
    }

    @PluginMethod
    fun onPaymentsError(call: PluginCall) {
        pendingPaymentResult = PaymentResult.fromCall(call)
        Log.d(TAG, "Payment error: ${pendingPaymentResult?.title.orEmpty()}")
        pendingPaymentResult?.let { result ->
            if (result.title == "카드사 불일치") {
                PaymentCallbackManager.fireError(
                    result.title,
                    "선택한 카드사와 조회된 카드사가 일치하지 않습니다.\n카드사를 재확인 후 결제해주세요.",
                    "선택한 카드사 : ${result.selectIssueName}\n조회된 카드사 : ${result.checkIssueName}",
                )
            } else {
                val contents = result.selectIssueName.ifBlank { result.contents }
                val subContents = result.checkIssueName.ifBlank { result.subContents }
                PaymentCallbackManager.fireError(result.title, contents, subContents)
            }
        }
        call.resolve()
    }

    fun getPendingPaymentResult(): PaymentResult? = pendingPaymentResult

    data class PaymentResult(
        val title: String,
        val contents: String,
        val subContents: String,
        val selectIssueName: String,
        val checkIssueName: String,
    ) {
        companion object {
            fun fromCall(call: PluginCall): PaymentResult =
                PaymentResult(
                    title = call.getString("title", "").orEmpty(),
                    contents = call.getString("contents", "").orEmpty(),
                    subContents = call.getString("subContents", "").orEmpty(),
                    selectIssueName = call.getString("selectIssueName", "").orEmpty(),
                    checkIssueName = call.getString("checkIssueName", "").orEmpty(),
                )
        }
    }

    companion object {
        private const val TAG = "PaykingOcrPlugin"
        private var activePlugin = WeakReference<PaykingOcrPlugin>(null)

        @JvmStatic
        fun emitOnPayment(
            payFunnel: String?,
            cardNumber: String?,
            expiry: String?,
            selectBankCode: String?,
            selectQuotaMonths: String?,
        ): Boolean {
            val plugin = activePlugin.get()
            if (plugin == null) {
                Log.w(TAG, "emitOnPayment skipped: plugin is not active.")
                return false
            }

            val data = JSObject().apply {
                put("payFunnel", payFunnel.orEmpty())
                put("cardNumber", cardNumber.orEmpty())
                put("expiry", expiry.orEmpty())
                put("selectBankCode", selectBankCode.orEmpty())
                put("selectQuotaMonths", selectQuotaMonths.orEmpty())
            }
            plugin.notifyListeners("onPayment", data)
            return true
        }
    }
}

