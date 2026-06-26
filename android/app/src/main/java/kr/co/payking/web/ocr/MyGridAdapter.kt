package kr.co.payking.web.ocr

import kr.co.payking.web.R

import android.graphics.Typeface
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import kr.co.payking.web.ocr.util.OcrParamsUtil.IssueBank

class MyGridAdapter(
    private val items: List<IssueBank>, private val customFont: Typeface,
    private val onItemClick: (IssueBank) -> Unit //  클릭 콜백 추가
) : RecyclerView.Adapter<MyGridAdapter.ViewHolder>() {

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val img: ImageView = itemView.findViewById(R.id.item_image)
        val txt: TextView = itemView.findViewById(R.id.item_text)



        fun bind(item: IssueBank) {
            txt.text = item.krNameCode
            txt.typeface = customFont //  폰트 적용
            Glide.with(itemView.context)
                .load(item.imageUrl)
                .into(img)

            itemView.setOnClickListener {
                onItemClick(item) // 클릭 시 콜백 실행
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.grid_item_layout, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount() = items.size
}


