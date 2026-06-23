import type { ActivityComponentType } from '@stackflow/react'
import { AxiosError } from 'axios'
import { useRef, useState } from 'react'
import {
  AppContainer,
  AppHeader,
  PhoneAuthForm,
  PKInput,
  type PhoneAuthFormRef,
} from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'
import userService from '../service/user'
import { useAlertStore } from '../stores/alertStore'
import { getApiErrorMessage, isNotFoundError } from '../utils/auth'
import { FindPwResetForm } from './FindPwResetForm'

type VerifiedContext = {
  phoneNumber: string
  authCode: string
}

export const FindPwActivity: ActivityComponentType<'findPw'> = () => {
  const navigation = useAppNavigation()
  const showAlert = useAlertStore((state) => state.showAlert)
  const formRef = useRef<PhoneAuthFormRef>(null)

  const [authId, setAuthId] = useState('')
  const [verifiedContext, setVerifiedContext] = useState<VerifiedContext | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isResetStep = verifiedContext !== null

  const goToLogin = () => {
    navigation.replace('login', {})
  }

  const handleSendAuth = async ({ phoneNumber }: { phoneNumber: string }) => {
    try {
      await userService.authPhoneNumberForFindPW(phoneNumber, authId)
    } catch (error) {
      if (isNotFoundError(error)) {
        showAlert({
          title: '인증번호 전송 실패',
          contents: '등록된 회원이 아닙니다.\n확인 후 다시 시도해주세요',
        })
        throw error
      }

      showAlert({
        title: '인증번호 전송 실패',
        contents: getApiErrorMessage(error),
      })
      throw error
    }
  }

  const handleVerify = async ({
    phoneNumber,
    authCode,
  }: {
    phoneNumber: string
    authCode: string
  }) => {
    try {
      await userService.checkAuthPhoneNumberForFindPW(phoneNumber, authId, authCode)
      setVerifiedContext({ phoneNumber, authCode })
      return true as const
    } catch (error) {
      if (error instanceof AxiosError) {
        return 'authFail' as const
      }

      showAlert({
        title: '인증 실패',
        contents: getApiErrorMessage(error),
      })
    }
  }

  const handleResetPassword = async ({
    password,
    confirmPassword,
  }: {
    password: string
    confirmPassword: string
  }) => {
    if (!verifiedContext || submitting) return

    setSubmitting(true)

    try {
      await userService.resetPWAuth({
        authId,
        password,
        confirmPassword,
        phoneNumber: verifiedContext.phoneNumber,
        authNumber: verifiedContext.authCode,
      })

      showAlert({
        title: '설정 완료',
        contents: '비밀번호 설정이 완료되었습니다.',
        onConfirm: goToLogin,
      })
    } catch (error) {
      showAlert({
        title: '비밀번호 설정 실패',
        contents: getApiErrorMessage(error),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppContainer
      contentClassName={isResetStep ? classes.resetContent : classes.formContent}
      topChildren={<AppHeader onBack={navigation.goBack} title="비밀번호 찾기" />}
      useScrollView={isResetStep}
    >
      {!isResetStep && (
        <PhoneAuthForm
          ref={formRef}
          canSend={({ phoneNumber }) => phoneNumber.length === 11 && authId.length > 0}
          leadingFields={
            <PKInput
              aria-label="아이디"
              onChangeText={(value) => {
                setAuthId(value)
                formRef.current?.clear()
              }}
              placeholder="아이디"
              type="id"
              value={authId}
              wrapperClassName={classes.input}
            />
          }
          onSendAuth={handleSendAuth}
          onVerify={handleVerify}
        />
      )}

      {verifiedContext && (
        <FindPwResetForm onSubmit={handleResetPassword} submitting={submitting} />
      )}
    </AppContainer>
  )
}

const classes = {
  formContent:
    'box-border flex min-h-full flex-1 items-center justify-center px-[30px]',
  resetContent:
    'box-border flex min-h-full w-full flex-col items-center justify-center px-[30px] py-6',
  input: 'w-full',
}
