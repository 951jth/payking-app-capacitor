import { AxiosError } from 'axios'
import type { ApiResponse } from '../service/axios'

export function getApiErrorMessage(error: unknown, fallback = '서버 오류') {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiResponse | undefined
    const systemMessage = response?.meta?.systemMessage
    const userMessage = response?.meta?.userMessage

    if (typeof userMessage === 'string' && userMessage) return userMessage
    if (typeof systemMessage === 'string' && systemMessage) return systemMessage
  }

  if (error instanceof Error && error.message) return error.message

  return fallback
}

export function isNotFoundError(error: unknown) {
  return error instanceof AxiosError && error.response?.status === 404
}
