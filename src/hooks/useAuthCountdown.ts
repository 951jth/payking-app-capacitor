import { useCallback, useEffect, useState } from 'react'

export function useAuthCountdown() {
  const [expireAt, setExpireAt] = useState<number | null>(null)
  const [time, setTime] = useState<number | null>(null)

  const clear = useCallback(() => {
    setExpireAt(null)
    setTime(null)
  }, [])

  const start = useCallback((seconds: number) => {
    setExpireAt(Date.now() + seconds * 1000)
    setTime(seconds)
  }, [])

  useEffect(() => {
    if (!expireAt) return

    const tick = () => {
      const remaining = Math.floor((expireAt - Date.now()) / 1000)

      if (remaining <= 0) {
        setExpireAt(null)
        setTime(-1)
      } else {
        setTime(remaining)
      }
    }

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expireAt])

  return { time, start, clear }
}

export function formatAuthCountdown(seconds: number | null) {
  if (seconds === null || seconds <= 0) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder >= 10 ? remainder : `0${remainder}`}`
}
