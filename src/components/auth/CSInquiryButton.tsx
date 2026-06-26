import { useState } from 'react'
import { PKButton } from '../button/PKButton'
import { PKConfirm } from '../modal/PKConfirm'
import { PKText } from '../typography/PKText'
import { useGlobalStore } from '../../stores/globalStore'
import { formatTelephone } from '../../utils/format'

type CSInquiryButtonProps = {
  buttonClassName?: string
  buttonTextClassName?: string
}

export function CSInquiryButton({
  buttonClassName,
  buttonTextClassName,
}: CSInquiryButtonProps) {
  const csInfo = useGlobalStore((state) => state.CSInfo)
  const [confirmVisible, setConfirmVisible] = useState(false)

  const handleCallCS = () => {
    setConfirmVisible(false)

    if (csInfo?.csTelNumber) {
      window.location.href = `tel:${csInfo.csTelNumber}`
    }
  }

  return (
    <>
      <PKButton
        type="text"
        className={buttonClassName ?? classes.button}
        onClick={() => setConfirmVisible(true)}
        textClassName={buttonTextClassName ?? classes.buttonText}
        title="문의하기"
      />

      <PKConfirm
        confirmTitle="전화걸기"
        contents={
          <div className={classes.alertContents}>
            <PKText
              as="p"
              className={classes.alertPhone}
              style={phoneTextStyle}
              weight={700}
            >
              {csInfo?.csTelNumber ? formatTelephone(csInfo.csTelNumber) : '-'}
            </PKText>
            <PKText
              as="p"
              className={classes.alertDesc}
              style={descTextStyle}
              weight={400}
            >
              {csInfo?.csTelDetail ?? '-'}
            </PKText>
          </div>
        }
        contentsClassName={classes.confirmContentsWrap}
        onConfirm={handleCallCS}
        onOpenChange={setConfirmVisible}
        onReject={() => setConfirmVisible(false)}
        title={
          <PKText as="p" className={classes.alertTitle} weight={400}>
            이용문의는 고객센터로 연락주세요.
          </PKText>
        }
        visible={confirmVisible}
      />
    </>
  )
}

const phoneTextStyle = {
  color: '#145ED9',
  fontSize: 36,
  lineHeight: '41px',
} as const

const descTextStyle = {
  color: '#8B9099',
  fontSize: 14,
  lineHeight: '21px',
} as const

const classes = {
  button: 'inline-flex h-6 shrink-0 items-center justify-center p-0',
  buttonText: 'text-xs font-extralight leading-none text-[#8B9099]',
  alertTitle: 'm-0 w-full text-center text-sm leading-normal text-[#191919]',
  confirmContentsWrap: 'mb-[25px] p-0 font-normal text-inherit',
  alertContents: 'flex flex-col items-center justify-center gap-2 pt-6',
  alertPhone: 'm-0 text-center',
  alertDesc: 'm-0 text-center',
}
