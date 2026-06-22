import { HomeMainActivity } from '../activities/HomeMainActivity'
import { LinkPaymentActivity } from '../activities/LinkPaymentActivity'
import { LoginActivity } from '../activities/LoginActivity'
import { PaymentHistoryActivity } from '../activities/PaymentHistoryActivity'
import { SampleDetailActivity } from '../activities/SampleDetailActivity'
import { SampleHomeActivity } from '../activities/SampleHomeActivity'
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
  homeMain: HomeMainActivity,
  paymentHistory: PaymentHistoryActivity,
  settlementHistory: SettlementHistoryActivity,
  linkPayment: LinkPaymentActivity,
  userHome: UserHomeActivity,
  sampleHome: SampleHomeActivity,
  sampleDetail: SampleDetailActivity,
}

export type ActivityName = (typeof activityDefinitions)[number]['name']

export type ActivityMeta = (typeof activityDefinitions)[number]

export function getActivityMeta(name: string) {
  return activityDefinitions.find((activity) => activity.name === name)
}
