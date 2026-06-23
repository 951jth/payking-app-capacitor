import { CancelRequestActivity } from '../activities/CancelRequestActivity'
import { FindIdActivity } from '../activities/FindIdActivity'
import { FindPwActivity } from '../activities/FindPwActivity'
import { HomeMainActivity } from '../activities/HomeMainActivity'
import { InvoiceActivity } from '../activities/InvoiceActivity'
import { LinkPaymentActivity } from '../activities/LinkPaymentActivity'
import { LoginActivity } from '../activities/LoginActivity'
import { PaymentHistoryActivity } from '../activities/PaymentHistoryActivity'
import { SampleDetailActivity } from '../activities/SampleDetailActivity'
import { SampleHomeActivity } from '../activities/SampleHomeActivity'
import { SettingActivity } from '../activities/SettingActivity'
import { SettlementHistoryActivity } from '../activities/SettlementHistoryActivity'
import { UserHomeActivity } from '../activities/UserHomeActivity'

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
    name: 'homeMain',
    title: '홈',
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
  {
    name: 'userHome',
    title: '홈',
    headerShown: false,
    auth: true,
  },
  {
    name: 'sampleHome',
    title: 'PayKing',
    headerShown: false,
    auth: false,
  },
  {
    name: 'sampleDetail',
    title: '샘플 상세',
    headerShown: true,
    auth: true,
  },
] as const

export const activityComponents = {
  login: LoginActivity,
  findId: FindIdActivity,
  findPw: FindPwActivity,
  homeMain: HomeMainActivity,
  paymentHistory: PaymentHistoryActivity,
  invoice: InvoiceActivity,
  cancelRequest: CancelRequestActivity,
  settlementHistory: SettlementHistoryActivity,
  linkPayment: LinkPaymentActivity,
  setting: SettingActivity,
  userHome: UserHomeActivity,
  sampleHome: SampleHomeActivity,
  sampleDetail: SampleDetailActivity,
}

export type ActivityName = (typeof activityDefinitions)[number]['name']

export type ActivityMeta = (typeof activityDefinitions)[number]

export function getActivityMeta(name: string) {
  return activityDefinitions.find((activity) => activity.name === name)
}
