import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL, API_TIMEOUT, isApiDebugEnabled } from '../../config/env'
import { useSessionStore } from '../../stores/sessionStore'
import { getNetworkStatus } from '../../adapters/networkAdapter'
import { removeEmptyQueryString } from '../../utils/queryString'

declare module 'axios' {
  export interface AxiosRequestConfig {
    useRemoveEmtyParams?: boolean
    useloading?: boolean
    qsArrayFormat?: 'repeat' | 'comma'
    loadingId?: string
    _retry?: boolean
  }

  export interface InternalAxiosRequestConfig {
    useRemoveEmtyParams?: boolean
    useloading?: boolean
    qsArrayFormat?: 'repeat' | 'comma'
    loadingId?: string
    _retry?: boolean
  }
}

export type ApiMeta = {
  code?: number | string
  userMessage?: string
  systemMessage?: string
  [key: string]: unknown
}

export type ApiResponse<T = unknown> = {
  data: T
  meta?: ApiMeta
  token?: string
  [key: string]: unknown
}

const defaultConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT,
  useRemoveEmtyParams: false,
  useloading: false,
  qsArrayFormat: 'repeat',
}

export const authInstance = axios.create(defaultConfig)

export const noAuthInstance = axios.create(defaultConfig)

export async function ensureOnline() {
  const status = await getNetworkStatus()

  if (!status.connected) {
    const error = new AxiosError(
      '네트워크에 연결되어 있지 않습니다.',
      'NETWORK_OFFLINE',
    )

    error.response = {
      data: {
        meta: {
          userMessage: '네트워크에 연결되어 있지 않습니다.',
          systemMessage: 'NETWORK_OFFLINE',
        },
      },
      status: 0,
      statusText: 'NETWORK_OFFLINE',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    }

    throw error
  }

  return status
}

function normalizeData(data: unknown) {
  if (data instanceof FormData) return data
  if (typeof data === 'string') return data
  if (data === undefined || data === null) return data
  return JSON.stringify(data)
}

function applyCommonRequestConfig(config: InternalAxiosRequestConfig) {
  config.data = normalizeData(config.data)

  if (config.useRemoveEmtyParams && config.url) {
    config.url = removeEmptyQueryString(
      config.url,
      config.qsArrayFormat ?? 'repeat',
    )
  }

  return config
}

export function getResponseToken(responseData: unknown) {
  if (!responseData || typeof responseData !== 'object') return null

  const payload = responseData as {
    token?: unknown
    data?: {
      token?: unknown
    }
  }

  if (typeof payload.token === 'string' && payload.token) return payload.token
  if (typeof payload.data?.token === 'string' && payload.data.token) {
    return payload.data.token
  }

  return null
}

async function refreshAccessToken() {
  const { accessToken, deviceToken, setAccessToken } = useSessionStore.getState()

  if (!accessToken || !deviceToken) {
    throw new Error('토큰 갱신에 필요한 토큰이 없습니다.')
  }

  const response = await noAuthInstance.post<ApiResponse>(
    '/api/auth/v1/refresh',
    {
      'user-token': accessToken,
      'device-token': deviceToken,
    },
  )

  const nextToken = getResponseToken(response.data)
  if (!nextToken) {
    throw new Error('토큰 갱신 응답에 token이 없습니다.')
  }

  setAccessToken(nextToken)
  return nextToken
}

function registerRequestInterceptor(
  instance: AxiosInstance,
  tokenType: 'access' | 'device',
) {
  instance.interceptors.request.use(async (config) => {
    await ensureOnline()

    const { accessToken, deviceToken } = useSessionStore.getState()
    const token = tokenType === 'access' ? accessToken : deviceToken

    if (token) {
      config.headers.set('access_token', token)
    }

    return applyCommonRequestConfig(config)
  })
}

authInstance.interceptors.response.use(
  (response) => {
    successLogging(response)
    return response
  },
  async (error: AxiosError<ApiResponse>) => {
    errorLogging(error)

    const originalRequest = error.config
    const systemMessage = error.response?.data?.meta?.systemMessage

    if (
      error.response?.status === 401 &&
      systemMessage === 'Expired token' &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        await refreshAccessToken()
        return authInstance(originalRequest)
      } catch {
        useSessionStore.getState().logout()
        return Promise.reject(error)
      }
    }

    if (error.response?.status === 401 && systemMessage === 'Block Token') {
      useSessionStore.getState().logout()
    }

    return Promise.reject(error)
  },
)

noAuthInstance.interceptors.response.use(
  (response) => {
    successLogging(response)
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    errorLogging(error)
    return Promise.reject(error)
  },
)

registerRequestInterceptor(authInstance, 'access')
registerRequestInterceptor(noAuthInstance, 'device')

function successLogging(response: AxiosResponse) {
  if (!isApiDebugEnabled) return

  const { config, status, statusText, data } = response
  const method = config.method?.toUpperCase()
  const url = config.url
  const requestBody = safeParse(config.data)

  console.groupCollapsed(`API 성공 [${method}] ${url} - ${status} ${statusText}`)
  console.log('Request Headers:', config.headers)
  if (requestBody) console.log('Request Body:', requestBody)
  console.log('Response:', data)
  console.groupEnd()
}

function errorLogging(error: AxiosError<ApiResponse>) {
  if (!isApiDebugEnabled) return
  if (!error.config) return

  const method = error.config.method?.toUpperCase()
  const url = error.config.url
  const status = error.response?.status
  const statusText = error.response?.statusText

  console.groupCollapsed(
    `API 실패 [${method}] ${url} - ${status ?? 'No response'} ${statusText ?? ''}`,
  )
  console.log('Request Headers:', error.config.headers)
  console.log('Request Body:', safeParse(error.config.data))
  console.log('Response:', error.response?.data)
  console.groupEnd()
}

function safeParse(data: unknown) {
  if (typeof data !== 'string') return data

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}
