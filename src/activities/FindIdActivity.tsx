import type { ActivityComponentType } from '@stackflow/react'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { AppContainer, AppHeader, PhoneAuthForm } from '../components'
import { useAppNavigation } from '../navigation/useAppNavigation'
import userService from '../service/user'
import { useAlertStore } from '../stores/alertStore'
import type { FindIdAccount } from '../types/auth'
import { getApiErrorMessage, isNotFoundError } from '../utils/auth'
import { getApiPayload } from '../utils/paymentHistory'
import { FindIdResult } from './FindIdResult'

export const FindIdActivity: ActivityComponentType<'findId'> = () => {
  const navigation = useAppNavigation()
  const showAlert = useAlertStore((state) => state.showAlert)
  const [findID, setFindID] = useState<FindIdAccount[] | undefined>()

  const goToLogin = () => {
    navigation.replace('login', {})
  }

  const handleSendAuth = async ({ phoneNumber }: { phoneNumber: string }) => {
    try {
      await userService.findIdPhoneNumber(phoneNumber)
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
      const response = await userService.findID(phoneNumber, authCode)
      const accounts = getApiPayload<FindIdAccount[]>(response).data ?? []
      setFindID(accounts)
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

  const isResult = findID !== undefined

  return (
    <AppContainer
      contentClassName={isResult ? classes.resultContent : classes.formContent}
      topChildren={<AppHeader onBack={navigation.goBack} title="아이디 찾기" />}
      useScrollView={isResult}
    >
      {findID === undefined && (
        <PhoneAuthForm onSendAuth={handleSendAuth} onVerify={handleVerify} />
      )}

      {findID !== undefined && (
        <FindIdResult accounts={findID} onLogin={goToLogin} />
      )}
    </AppContainer>
  )
}

const classes = {
  formContent:
    'box-border flex min-h-full flex-1 items-center justify-center px-[30px]',
  resultContent:
    'box-border flex min-h-full w-full flex-col items-center justify-center px-[30px] py-6',
}
