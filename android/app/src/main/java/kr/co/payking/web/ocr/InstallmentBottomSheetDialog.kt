package kr.co.payking.web.ocr

import kr.co.payking.web.R

import android.app.Dialog
import android.graphics.Typeface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.LinearSnapHelper
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kr.co.payking.web.ocr.util.OcrParamsUtil

/**
 * Created by yang on 2025-07-17.
 */
class InstallmentBottomSheetDialog(private val customFont: Typeface,private val  installmentMonths:List<OcrParamsUtil.InstallmentMonth>) : BottomSheetDialogFragment() {

    interface OnInstallmentSelectedListener {
        fun onInstallmentSelected(item: OcrParamsUtil.InstallmentMonth)
    }

    private var listener: OnInstallmentSelectedListener? = null
    private lateinit var recyclerView: RecyclerView
    private lateinit var btnApply: Button
    private lateinit var adapter: InstallmentAdapter
    private lateinit var title : TextView
    private var selectedPosition = 0



    fun setOnInstallmentSelectedListener(listener: OnInstallmentSelectedListener) {
        this.listener = listener
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.bottom_sheet_installment, container, false)

        recyclerView = view.findViewById(R.id.rv_installment)
        btnApply = view.findViewById(R.id.btn_apply)
        title = view.findViewById(R.id.tv_title)
        btnApply.typeface = customFont
        title.typeface = customFont

        adapter = InstallmentAdapter(installmentMonths,customFont)
        recyclerView.layoutManager = LinearLayoutManager(context, LinearLayoutManager.VERTICAL, false)
        recyclerView.adapter = adapter

        // SnapHelper (가운데 정렬)
        val snapHelper = LinearSnapHelper()
        snapHelper.attachToRecyclerView(recyclerView)

        recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrollStateChanged(recyclerView: RecyclerView, newState: Int) {
                if (newState == RecyclerView.SCROLL_STATE_IDLE) {
                    val centerView = snapHelper.findSnapView(recyclerView.layoutManager)
                    selectedPosition = recyclerView.getChildAdapterPosition(centerView!!)
                    adapter.setSelectedPosition(selectedPosition)
                }
            }
        })

        btnApply.setOnClickListener {
            listener?.onInstallmentSelected(installmentMonths[selectedPosition])
            dismiss()
        }

        return view
    }



    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = BottomSheetDialog(requireContext(), R.style.MyBottomSheetDialogTheme)

        dialog.setOnShowListener { dlg ->
            val bottomSheet = (dlg as BottomSheetDialog)
                .findViewById<View>(com.google.android.material.R.id.design_bottom_sheet)

            bottomSheet?.let {
                val layoutParams = it.layoutParams
                layoutParams.height = (resources.displayMetrics.heightPixels * 0.5).toInt()
                it.layoutParams = layoutParams

                val behavior = BottomSheetBehavior.from(it)
                behavior.state = BottomSheetBehavior.STATE_EXPANDED
            }
        }

        return dialog
    }
}


