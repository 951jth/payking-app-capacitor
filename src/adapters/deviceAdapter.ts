import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'
import { APP_VERSION } from '../config/env'

export type PaykingOsType = 'IOS' | 'ANDROID' | 'WEB'

export type DeviceRegistrationInfo = {
  appVersion: string | null
  fcmPushToken: string | null
  model: string | null
  osType: PaykingOsType
  osVersion: string | null
  uuid: string
}

function normalizeOsType(platform: string): PaykingOsType {
  if (platform === 'ios') return 'IOS'
  if (platform === 'android') return 'ANDROID'
  return 'WEB'
}

function createUuid() {
  return globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}`
}

function getBrowserVersion() {
  const userAgent = globalThis.navigator?.userAgent ?? ''
  let match =
    userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) ??
    []

  if (/trident/i.test(match[1])) {
    const ieMatch = /\brv[ :]+(\d+)/g.exec(userAgent) ?? []
    return `IE ${ieMatch[1] ?? ''}`.trim()
  }

  if (match[1] === 'Chrome') {
    const edgeMatch = userAgent.match(/\b(OPR|Edge|Edg)\/(\d+)/)
    if (edgeMatch) {
      const browserName = edgeMatch[1].replace('OPR', 'Opera').replace('Edg', 'Edge')
      return `${browserName} ${edgeMatch[2]}`
    }
  }

  const kakaoMatch = userAgent.match(/KAKAOTALK\s+([\d.]+)/)
  if (kakaoMatch) return `KAKAOTALK ${kakaoMatch[1]}`

  match = match[2] ? [match[1], match[2]] : [globalThis.navigator?.appName ?? 'WEB', globalThis.navigator?.appVersion ?? '']

  const version = userAgent.match(/version\/(\d+)/i)
  if (version) match.splice(1, 1, version[1])

  return match.join(' ')
}

function getWebDeviceRegistrationInfo(
  existingUuid?: string | null,
): DeviceRegistrationInfo {
  return {
    appVersion: APP_VERSION,
    fcmPushToken: null,
    model: globalThis.navigator?.userAgent ?? null,
    osType: 'WEB',
    osVersion: getBrowserVersion(),
    uuid: existingUuid ?? createUuid(),
  }
}

export async function getDeviceRegistrationInfo(
  existingUuid?: string | null,
): Promise<DeviceRegistrationInfo> {
  if (!Capacitor.isNativePlatform()) {
    return getWebDeviceRegistrationInfo(existingUuid)
  }

  const [deviceInfo, deviceId, appInfo] = await Promise.allSettled([
    Device.getInfo(),
    Device.getId(),
    App.getInfo(),
  ])

  const resolvedDeviceInfo =
    deviceInfo.status === 'fulfilled' ? deviceInfo.value : null
  const resolvedDeviceId = deviceId.status === 'fulfilled' ? deviceId.value : null
  const resolvedAppInfo = appInfo.status === 'fulfilled' ? appInfo.value : null

  return {
    appVersion: resolvedAppInfo?.version ?? null,
    fcmPushToken: null,
    model: resolvedDeviceInfo?.model ?? null,
    osType: normalizeOsType(resolvedDeviceInfo?.platform ?? 'web'),
    osVersion: resolvedDeviceInfo?.osVersion ?? null,
    uuid: resolvedDeviceId?.identifier ?? existingUuid ?? createUuid(),
  }
}
