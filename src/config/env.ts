const DEFAULT_DEV_API_URL = 'https://api-dev.pay-king.co.kr'

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '')
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL ?? DEFAULT_DEV_API_URL,
)

export const API_TIMEOUT = 1000 * 15

export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0'

export const WEB_LINK_URL = normalizeBaseUrl(
  import.meta.env.VITE_WEB_LINK_URL ?? 'https://cp.pay-king.co.kr',
)

export const FCM_TOPICS = {
  ios: {
    notice: import.meta.env.VITE_FCM_IOS_TOPIC ?? '',
    storeNotice: import.meta.env.VITE_FCM_IOS_STORE_TOPIC ?? '',
    staffNotice: import.meta.env.VITE_FCM_IOS_STAFF_TOPIC ?? '',
  },
  android: {
    notice: import.meta.env.VITE_FCM_AOS_TOPIC ?? '',
    storeNotice: import.meta.env.VITE_FCM_AOS_STORE_TOPIC ?? '',
    staffNotice: import.meta.env.VITE_FCM_AOS_STAFF_TOPIC ?? '',
  },
} as const

export const isApiDebugEnabled = import.meta.env.DEV
