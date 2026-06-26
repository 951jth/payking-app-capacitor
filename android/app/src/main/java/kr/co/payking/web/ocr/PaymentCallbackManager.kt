package kr.co.payking.web.ocr

import android.util.Log

/**
 * RN -> Native 결제 결과 콜백 브리지 (싱글 오너 방식).
 *
 * - 동시에 하나의 화면(Activity)만 콜백을 받도록 설계.
 * - register(ownerTag, ...) 로 현재 활성 화면을 지정.
 * - unregister(ownerTag) 호출 시, 현재 오너가 맞을 때만 해제.
 * - 리스너 등록 전에 이벤트가 들어오면 pending에 보관 후 등록 시 전달.
 */
object PaymentCallbackManager {

    private const val TAG = "PCM"

    // 현재 리스너의 주인(Activity 식별용 태그)
    private var currentOwner: String? = null

    // 리스너
    private var successListener: ((String, String,String?) -> Unit)? = null
    private var errorListener:  ((String, String,String?) -> Unit)? = null

    // pending
    private var pendingSuccess: Triple<String, String,String?>? = null
    private var pendingError:   Triple<String, String,String?>? = null

    /**
     * 리스너 등록.
     * 기존 오너가 있다면 덮어쓴다 (교체).
     */
    @JvmStatic
    fun register(
        ownerTag: String,
        onSuccess: (String, String,String?) -> Unit,
        onError: (String, String,String?) -> Unit
    ) {
        Log.d(TAG, "register(owner=$ownerTag) replacing owner=$currentOwner")
        currentOwner = ownerTag
        successListener = onSuccess
        errorListener = onError

        // pending flush
        pendingSuccess?.let { (t, c,s) ->
            Log.d(TAG, "flushing pending success to owner=$ownerTag")
            onSuccess(t, c, s)
            pendingSuccess = null
        }
        pendingError?.let { (t, c,s) ->
            Log.d(TAG, "flushing pending error to owner=$ownerTag")
            onError(t, c, s)
            pendingError = null
        }
    }

    /**
     * 리스너 해제.
     * ownerTag가 현재 오너와 일치할 때만 해제.
     * (다른 Activity에서 늦게 온 unregister 호출은 무시)
     */
    @JvmStatic
    fun unregister(ownerTag: String) {
        if (currentOwner == ownerTag) {
            Log.d(TAG, "unregister(owner=$ownerTag) -> cleared")
            currentOwner = null
            successListener = null
            errorListener = null
        } else {
            Log.d(TAG, "unregister(owner=$ownerTag) ignored; currentOwner=$currentOwner")
        }
    }

    @JvmStatic
    fun fireSuccess(title: String, contents: String, subContents: String? = null) {
        Log.d(TAG, "fireSuccess(owner=$currentOwner, listener=$successListener, title=$title)")
        val l = successListener
        if (l != null) {
            l(title, contents,subContents)
        } else {
            pendingSuccess = Triple(title ,contents,subContents)
            Log.d(TAG, "success queued (no listener)")
        }
    }

    @JvmStatic
    fun fireError(title: String, contents: String,subContents: String? = null) {
        Log.d(TAG, "fireError(owner=$currentOwner, listener=$errorListener, title=$title)")
        val l = errorListener
        if (l != null) {
            l(title, contents, subContents)
        } else {
            pendingError = Triple(title, contents, subContents)
            Log.d(TAG, "error queued (no listener)")
        }
    }
}

