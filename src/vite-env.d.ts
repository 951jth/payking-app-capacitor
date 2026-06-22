/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_WEB_LINK_URL?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_FCM_IOS_TOPIC?: string
  readonly VITE_FCM_IOS_STORE_TOPIC?: string
  readonly VITE_FCM_IOS_STAFF_TOPIC?: string
  readonly VITE_FCM_AOS_TOPIC?: string
  readonly VITE_FCM_AOS_STORE_TOPIC?: string
  readonly VITE_FCM_AOS_STAFF_TOPIC?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
