package kr.co.payking.web.ocr

import kr.co.payking.web.R

import android.graphics.Color
import android.graphics.Typeface
import android.util.TypedValue
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import kr.co.payking.web.ocr.util.OcrParamsUtil

/**
 * Created by yang on 2025-07-17.
 */
class InstallmentAdapter(private val items: List<OcrParamsUtil.InstallmentMonth>, private val customFont: Typeface) :
    RecyclerView.Adapter<InstallmentAdapter.ViewHolder>() {

    private var selectedPosition = 0

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val textView: TextView = itemView.findViewById(R.id.tv_item)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_installment, parent, false)
        return ViewHolder(view)
    }

    override fun getItemCount() = items.size

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.textView.text = items[position].label

        holder.textView.typeface = customFont // ✅ 폰트 적용

        if (position == selectedPosition) {
            holder.textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
            holder.textView.setBackgroundResource(R.drawable.bg_selected_round)
            holder.textView.setTextColor(
                ContextCompat.getColor(holder.itemView.context, R.color.color_191919)
            )
        } else {
            holder.textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            holder.textView.setBackgroundColor(Color.TRANSPARENT)
            holder.textView.setTextColor(
                ContextCompat.getColor(holder.itemView.context, R.color.color_C7CED9)
            )
        }

        holder.itemView.setOnClickListener {
            val previousPosition = selectedPosition
            selectedPosition = position

            if (previousPosition != RecyclerView.NO_POSITION) {
                notifyItemChanged(previousPosition) // 이전 선택 해제
            }
            notifyItemChanged(selectedPosition) // 새로운 선택 적용
        }
    }

    fun setSelectedPosition(position: Int) {
        val oldPosition = selectedPosition
        selectedPosition = position
        notifyItemChanged(oldPosition)
        notifyItemChanged(selectedPosition)
    }
}


