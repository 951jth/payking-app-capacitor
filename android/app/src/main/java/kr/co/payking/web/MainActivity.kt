package kr.co.payking.web

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import kr.co.payking.web.ocr.PaykingOcrPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(PaykingOcrPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
