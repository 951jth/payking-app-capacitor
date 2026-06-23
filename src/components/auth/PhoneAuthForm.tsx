import {
  forwardRef,
  useImperativeHandle,
  useState,
  type ReactNode,
} from 'react'
import { formatAuthCountdown, useAuthCountdown } from '../../hooks/useAuthCountdown'
import { PKButton } from '../button/PKButton'
import { PKInput } from '../input/PKInput'
import { PKText } from '../typography/PKText'

export type PhoneAuthContext = {
  phoneNumber: string
  authCode: string
}

export type PhoneAuthVerifyResult = true | 'authFail' | void

export type PhoneAuthFormRef = {
  clear: () => void
}

type PhoneAuthFormProps = {
  leadingFields?: ReactNode
  canSend?: (ctx: Pick<PhoneAuthContext, 'phoneNumber'>) => boolean
  onSendAuth: (ctx: Pick<PhoneAuthContext, 'phoneNumber'>) => void | Promise<void>
  onVerify: (ctx: PhoneAuthContext) => PhoneAuthVerifyResult | Promise<PhoneAuthVerifyResult>
  timerSeconds?: number
  className?: string
}

export const PhoneAuthForm = forwardRef<PhoneAuthFormRef, PhoneAuthFormProps>(
  function PhoneAuthForm(
    { leadingFields, canSend, onSendAuth, onVerify, timerSeconds = 90, className },
    ref,
  ) {
    const { time, start, clear: clearTimer } = useAuthCountdown()

    const [phoneNumber, setPhoneNumber] = useState('')
    const [authCode, setAuthCode] = useState('')
    const [sendAuth, setSendAuth] = useState(false)
    const [isAuthFail, setIsAuthFail] = useState(false)
    const [sendingAuth, setSendingAuth] = useState(false)
    const [verifying, setVerifying] = useState(false)

    const clearAuthState = () => {
      setIsAuthFail(false)

      if (time !== null) {
        setSendAuth(false)
        clearTimer()
        setAuthCode('')
      }
    }

    useImperativeHandle(ref, () => ({
      clear: clearAuthState,
    }))

    const canSendAuth = canSend
      ? canSend({ phoneNumber })
      : phoneNumber.length === 11

    const authErrorMessage =
      time !== null && time < 0
        ? '입력시간이 초과되었습니다.'
        : isAuthFail
          ? '인증번호가 올바르지 않습니다.'
          : ''

    const handleSendAuth = async () => {
      if (sendingAuth) return

      setSendingAuth(true)

      try {
        await onSendAuth({ phoneNumber })
        setSendAuth(true)
        start(timerSeconds)
        setAuthCode('')
        setIsAuthFail(false)
      } finally {
        setSendingAuth(false)
      }
    }

    const handleVerify = async () => {
      if (verifying || time === null || time <= 0 || authCode.length !== 6) return

      setVerifying(true)

      try {
        const result = await onVerify({ phoneNumber, authCode })

        if (result === 'authFail') {
          setIsAuthFail(true)
          return
        }

        if (result === true) {
          clearTimer()
        }
      } finally {
        setVerifying(false)
      }
    }

    return (
      <section className={[classes.root, className].filter(Boolean).join(' ')}>
        {leadingFields}

        <PKInput
          aria-label="휴대폰 번호"
          onChangeText={(value) => {
            setPhoneNumber(value)
            clearAuthState()
          }}
          placeholder="휴대폰 번호"
          type="phoneNumber"
          value={phoneNumber}
          wrapperClassName={classes.input}
        />

        {sendAuth && (
          <>
            <PKInput
              aria-label="인증번호"
              inputMode="numeric"
              maxLength={6}
              onChangeText={setAuthCode}
              placeholder="인증번호"
              postButton={
                <span className={classes.timer}>{formatAuthCountdown(time)}</span>
              }
              value={authCode}
              wrapperClassName={classes.input}
            />

            <div className={classes.authMeta}>
              <PKText className={classes.authError} weight={200}>
                {authErrorMessage}
              </PKText>
              <PKButton
                buttonType="text"
                className={classes.resendButton}
                onClick={() => {
                  setIsAuthFail(false)
                  void handleSendAuth()
                }}
                title="인증번호 재발송"
              />
            </div>
          </>
        )}

        {!sendAuth && (
          <PKButton
            buttonType="standard"
            disabled={!canSendAuth}
            loading={sendingAuth}
            onClick={() => void handleSendAuth()}
            title="인증번호 전송"
          />
        )}

        {sendAuth && (
          <PKButton
            buttonType="standard"
            disabled={authCode.length !== 6 || time === null || time < 0}
            loading={verifying}
            onClick={() => void handleVerify()}
            title="인증 완료"
          />
        )}
      </section>
    )
  },
)

const classes = {
  root: 'flex w-full self-stretch flex-col gap-4',
  input: 'w-full',
  authMeta: 'flex w-full items-center justify-between',
  authError:
    'm-0 !text-[12px] !leading-none !tracking-normal text-[#e22c17] [&:empty]:min-h-[18px]',
  timer:
    'shrink-0 text-[12px] font-medium leading-none tracking-[0.16px] font-[var(--pk-font-scd)] text-[#145ed9]',
  resendButton: 'inline-flex h-6 shrink-0 items-center justify-center p-0',
}
