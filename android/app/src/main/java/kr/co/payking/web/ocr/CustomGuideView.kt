package kr.co.payking.web.ocr

import android.content.Context
import android.util.AttributeSet
import android.view.View
import com.nhncloud.android.ocr.creditcard.CreditCardDetectable

class CustomGuideView(
    context: Context, attrs: AttributeSet?
): View(context, attrs), CreditCardDetectable {

    override fun setDetected(detected: Boolean) {

    }
}

