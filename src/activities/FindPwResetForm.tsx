import { useState } from 'react'
import { PKButton, PKInput } from '../components'
import { isValidPassword } from '../utils/validation'

type FindPwResetFormProps = {
  onSubmit: (payload: { password: string; confirmPassword: string }) => void | Promise<void>
  submitting?: boolean
}

export function FindPwResetForm({ onSubmit, submitting = false }: FindPwResetFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const canSubmit =
    isValidPassword(password) &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword

  return (
    <section className={classes.root}>
      <div className={classes.field}>
        <PKInput
          aria-label="새 비밀번호"
          onChangeText={setPassword}
          placeholder="새 비밀번호를 설정해 주세요."
          type="password"
          value={password}
          wrapperClassName={classes.input}
        />
        {password.length > 0 && !isValidPassword(password) && (
          <span className={classes.hint}>
            영문자 + 숫자 또는 특수문자 조합으로 8자 이상 입력해주세요.
          </span>
        )}
      </div>

      <div className={classes.field}>
        <PKInput
          aria-label="비밀번호 확인"
          onChangeText={setConfirmPassword}
          placeholder="비밀번호를 한번 더 입력해 주세요."
          type="password"
          value={confirmPassword}
          wrapperClassName={classes.input}
        />
        {password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword && (
          <span className={classes.hint}>비밀번호가 일치하지 않습니다.</span>
        )}
      </div>

      <PKButton
        type="standard"
        disabled={!canSubmit}
        loading={submitting}
        onClick={() => void onSubmit({ password, confirmPassword })}
        title="설정 완료"
      />
    </section>
  )
}

const classes = {
  root: 'flex w-full self-stretch flex-col gap-4',
  field: 'grid w-full gap-2',
  input: 'w-full',
  hint:
    'ml-1 block text-[12px] font-normal leading-[18px] font-[var(--pk-font-ptd)] text-[#e22c17]',
}
