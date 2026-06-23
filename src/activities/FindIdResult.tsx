import { PKButton, PKText } from '../components'
import type { FindIdAccount } from '../types/auth'

type FindIdResultProps = {
  accounts: FindIdAccount[]
  onLogin: () => void
}

export function FindIdResult({ accounts, onLogin }: FindIdResultProps) {
  if (accounts.length === 0) {
    return (
      <section className={classes.section}>
        <PKText className={classes.text}>등록된 회원이 아닙니다.</PKText>
        <PKText className={classes.text}>확인 후 다시 시도해주세요.</PKText>
        <PKButton
          buttonType="standard"
          className={classes.loginButton}
          onClick={onLogin}
          title="로그인하기"
        />
      </section>
    )
  }

  if (accounts.length === 1) {
    return (
      <section className={classes.section}>
        <PKText className={classes.text}>고객님의 아이디는</PKText>
        <PKText className={classes.text}>
          <PKText as="span" className={classes.id} weight={700}>
            {accounts[0].authId}{' '}
          </PKText>
          입니다.
        </PKText>
        <PKButton
          buttonType="standard"
          className={classes.loginButton}
          onClick={onLogin}
          title="로그인하기"
        />
      </section>
    )
  }

  return (
    <section className={classes.sectionWide}>
      <PKText className={classes.text}>고객님의 아이디는</PKText>
      <div className={classes.idList}>
        {accounts.map((account, index) => (
          <div className={classes.idRow} key={`${account.authId}-${index}`}>
            <PKText>{account.userName}</PKText>
            <PKText>{account.authId}</PKText>
          </div>
        ))}
      </div>
      <PKButton
        buttonType="standard"
        className={classes.loginButton}
        onClick={onLogin}
        title="로그인하기"
      />
    </section>
  )
}

const classes = {
  section: 'flex w-full flex-col items-center gap-2 text-center',
  sectionWide: 'flex w-full flex-col items-center gap-4 text-center',
  text: 'm-0 text-[15px] font-medium text-[var(--pk-text)]',
  id: 'text-xl text-[#145ed9]',
  idList: 'grid w-full gap-4',
  idRow: 'flex w-full items-center justify-between',
  loginButton: 'mt-3.5 w-full',
}
