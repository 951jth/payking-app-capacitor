package kr.co.payking.web.ocr.util

import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import kr.co.payking.web.ocr.GridItem
import org.json.JSONArray
import org.json.JSONObject

object OcrParamsUtil {
    data class InstallmentMonth(
        val value: Int? = null,
        val label: String? = null,
    )

    data class IssueBank(
        val createdBy: String? = null,
        val created: String? = null,
        val isUsable: Boolean? = null,
        val enNameCode: String? = null,
        val name: String? = null,
        val standardCode: String? = null,
        val installmentMonths: List<InstallmentMonth> = emptyList(),
        val krNameCode: String? = null,
        val ord: Int? = null,
        val enName: String? = null,
        val code: String? = null,
        val imageUrl: String? = null,
    )

    data class OCRParams(
        val selectQuotaMonths: String? = null,
        val selectBankCode: String? = null,
        val issueBankList: List<IssueBank> = emptyList(),
    )

    private const val TAG = "OcrParamsUtil"
    private val gson by lazy { Gson() }

    @JvmStatic
    fun parseFromJson(json: String?): OCRParams? {
        if (json.isNullOrBlank()) return null
        return try {
            gson.fromJson(json, OCRParams::class.java)
        } catch (error: JsonSyntaxException) {
            Log.e(TAG, "parseFromJson: invalid json\n$json", error)
            null
        }
    }

    @JvmStatic
    fun prettyPrint(json: String?): String {
        if (json.isNullOrBlank()) return ""
        return try {
            val trimmed = json.trim()
            when {
                trimmed.startsWith("{") -> JSONObject(trimmed).toString(2)
                trimmed.startsWith("[") -> JSONArray(trimmed).toString(2)
                else -> json
            }
        } catch (_: Exception) {
            json
        }
    }

    @JvmStatic
    fun OCRParams.findBankBySelectedCode(): IssueBank? =
        findBankByCode(selectBankCode)

    @JvmStatic
    fun OCRParams.findBankByCode(code: String?): IssueBank? =
        issueBankList.firstOrNull { it.code == code }

    @JvmStatic
    fun IssueBank.displayName(): String =
        name ?: krNameCode ?: enName ?: code.orEmpty()

    @JvmStatic
    fun List<IssueBank>.toGridItems(
        logoResolver: (IssueBank) -> String? = { it.imageUrl },
        idResolver: (IssueBank) -> Long = { it.code?.toLongOrNull() ?: -1L },
        nameResolver: (IssueBank) -> String = { it.displayName() },
    ): List<GridItem> =
        map { bank ->
            GridItem(
                imageUrl = logoResolver(bank).orEmpty(),
                text = nameResolver(bank),
                id = idResolver(bank),
            )
        }
}

