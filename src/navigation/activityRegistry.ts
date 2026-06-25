import { CancelRequestActivity } from '../activities/CancelRequestActivity'
import { FindIdActivity } from '../activities/FindIdActivity'
import { FindPwActivity } from '../activities/FindPwActivity'
import { MainTabActivity } from '../activities/MainTabActivity'
import { InvoiceActivity } from '../activities/InvoiceActivity'
import { LinkPaymentActivity } from '../activities/LinkPaymentActivity'
import { LoginActivity } from '../activities/LoginActivity'
import { PaymentHistoryActivity } from '../activities/PaymentHistoryActivity'
import { SettingActivity } from '../activities/SettingActivity'
import { SettlementHistoryActivity } from '../activities/SettlementHistoryActivity'

export const initialActivity = 'login'

export const activityDefinitions = [
  {
    name: 'login',
    title: '로그인',
    headerShown: false,
    auth: false,
    guestOnly: true,
  },
  {
    name: 'findId',
    title: '아이디 찾기',
    headerShown: true,
    auth: false,
    guestOnly: true,
  },
  {
    name: 'findPw',
    title: '비밀번호 찾기',
    headerShown: true,
    auth: false,
    guestOnly: true,
  },
  {
    name: 'mainTab',
    title: '메인 탭',
    headerShown: false,
    auth: true,
  },
  {
    name: 'paymentHistory',
    title: '결제 현황',
    headerShown: true,
    auth: true,
  },
  {
    name: 'invoice',
    title: '결제 명세서',
    headerShown: true,
    auth: true,
  },
  {
    name: 'cancelRequest',
    title: '결제 취소 요청',
    headerShown: true,
    auth: true,
  },
  {
    name: 'settlementHistory',
    title: '정산 현황',
    headerShown: true,
    auth: true,
  },
  {
    name: 'linkPayment',
    title: '링크/QR코드 결제',
    headerShown: true,
    auth: true,
  },
  {
    name: 'setting',
    title: '설정',
    headerShown: true,
    auth: true,
  },
] as const

export const activityComponents = {
  login: LoginActivity,
  findId: FindIdActivity,
  findPw: FindPwActivity,
  mainTab: MainTabActivity,
  paymentHistory: PaymentHistoryActivity,
  invoice: InvoiceActivity,
  cancelRequest: CancelRequestActivity,
  settlementHistory: SettlementHistoryActivity,
  linkPayment: LinkPaymentActivity,
  setting: SettingActivity,
}

export type ActivityName = (typeof activityDefinitions)[number]['name']

export type ActivityMeta = (typeof activityDefinitions)[number]

export function getActivityMeta(name: string) {
  return activityDefinitions.find((activity) => activity.name === name)
}
