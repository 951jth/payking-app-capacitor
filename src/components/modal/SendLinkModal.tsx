import { useEffect, useState } from 'react'
import { BottomModal } from './BottomModal'
import { PKButton } from '../button/PKButton'
import { PKInput } from '../input/PKInput'
import { PKText } from '../typography/PKText'

type SendLinkModalProps = {
  visible?: boolean
  onClose?: () => void
  onSend?: (phoneNumber: string) => void
  closeClear?: boolean
  title?: string
  buttonTitle?: string
}

export function SendLinkModal({
  visible = false,
  onClose,
  onSend,
  closeClear = false,
  title = '받을 사람 연락처',
  buttonTitle = '링크 보내기',
}: SendLinkModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    if (!visible && closeClear) {
      setPhoneNumber('')
    }
  }, [closeClear, visible])

  return (
    <BottomModal visible={visible} onClose={onClose} useScrollView={false}>
      <div className={classes.content}>
        <PKText as="h2" className={classes.title} weight={200}>
          {title}
        </PKText>
        <div className={classes.field}>
          <PKText as="label" className={classes.label} weight={400}>
            휴대폰번호
          </PKText>
          <PKInput
            onChangeText={setPhoneNumber}
            placeholder="휴대폰번호를 입력하세요."
            type="phoneNumber"
            value={phoneNumber}
          />
        </div>
        <div className={classes.action}>
          <PKButton
            buttonType="standard"
            colorType="primary"
            disabled={phoneNumber.length !== 11}
            onClick={() => onSend?.(phoneNumber)}
            title={buttonTitle}
          />
        </div>
      </div>
    </BottomModal>
  )
}

const classes = {
  content:
    'box-border grid justify-items-center px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2',
  title: 'm-0 text-center text-[16px] leading-[1.2] text-[#191919]',
  field: 'mt-4 grid w-full gap-2',
  label: 'm-0 text-[14px] leading-5 text-[#575e6b]',
  action: 'mt-6 flex w-full items-center',
}
