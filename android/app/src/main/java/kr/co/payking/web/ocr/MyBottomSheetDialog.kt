package kr.co.payking.web.ocr

import kr.co.payking.web.R

import android.app.Dialog
import android.graphics.Typeface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import kr.co.payking.web.ocr.util.OcrParamsUtil.IssueBank

class MyBottomSheetDialog(private val customFont: Typeface, private val cardList:List<IssueBank>) : BottomSheetDialogFragment() {

    // ✅ 선택된 값 전달을 위한 콜백 인터페이스
    interface OnItemSelectedListener {
        fun onItemSelected(item: IssueBank)
    }

    private var listener: OnItemSelectedListener? = null

    fun setOnItemSelectedListener(listener: OnItemSelectedListener) {
        this.listener = listener
    }

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: MyGridAdapter
    private lateinit var title: TextView

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.bottom_sheet_dialog, container, false)
    }




    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = BottomSheetDialog(requireContext(), R.style.MyBottomSheetDialogTheme)

        dialog.setOnShowListener { dlg ->
            val bottomSheet = (dlg as BottomSheetDialog)
                .findViewById<View>(com.google.android.material.R.id.design_bottom_sheet)

//            bottomSheet?.let {
//                val layoutParams = it.layoutParams
//                layoutParams.height = (resources.displayMetrics.heightPixels * 0.6).toInt()
//                it.layoutParams = layoutParams
//
//                val behavior = BottomSheetBehavior.from(it)
//                behavior.state = BottomSheetBehavior.STATE_EXPANDED
//            }
        }

        return dialog
    }

    override fun onStart() {
        super.onStart()
        val dialog = dialog as? BottomSheetDialog
//        val bottomSheet = dialog?.findViewById<View>(com.google.android.material.R.id.design_bottom_sheet)
//        bottomSheet?.let {
//            val behavior = BottomSheetBehavior.from(it)
//            behavior.peekHeight = 2000
//        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.rv_grid)
        recyclerView.layoutManager = GridLayoutManager(context, 3)
        title = view.findViewById(R.id.tv_title)


        //  어댑터에 클릭 콜백 전달
        adapter = MyGridAdapter(cardList.filter { it.isUsable ?: false }.sortedBy { it.ord ?: Int.MAX_VALUE },customFont) { selectedItem ->
            listener?.onItemSelected(selectedItem) //  선택 값 콜백 전달
            dismiss()
        }

        recyclerView.adapter = adapter
    }
}


