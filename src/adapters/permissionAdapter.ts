import { Camera } from '@capacitor/camera'
import { Contacts } from '@capacitor-community/contacts'
import { Capacitor, type PermissionState } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

type NormalizedPermissionState =
  | PermissionState
  | 'limited'
  | 'unavailable'

export type AppPermissionSnapshot = {
  camera: NormalizedPermissionState
  contacts: NormalizedPermissionState
  notifications: NormalizedPermissionState
  photos: NormalizedPermissionState
  requiredGranted: boolean
}

function isCameraGranted(status: NormalizedPermissionState) {
  return status === 'granted'
}

function isPhotosGranted(status: NormalizedPermissionState) {
  return status === 'granted' || status === 'limited'
}

function createSnapshot(
  camera: NormalizedPermissionState,
  photos: NormalizedPermissionState,
  contacts: NormalizedPermissionState,
  notifications: NormalizedPermissionState,
): AppPermissionSnapshot {
  return {
    camera,
    contacts,
    notifications,
    photos,
    requiredGranted: isCameraGranted(camera) && isPhotosGranted(photos),
  }
}

async function checkContactsPermission(): Promise<NormalizedPermissionState> {
  if (!Capacitor.isPluginAvailable('Contacts')) return 'unavailable'

  try {
    const result = await Contacts.checkPermissions()
    return result.contacts
  } catch {
    return 'unavailable'
  }
}

async function requestContactsPermission(): Promise<NormalizedPermissionState> {
  if (!Capacitor.isPluginAvailable('Contacts')) return 'unavailable'

  try {
    const result = await Contacts.requestPermissions()
    return result.contacts
  } catch {
    return 'unavailable'
  }
}

export async function checkAppPermissions(): Promise<AppPermissionSnapshot> {
  if (!Capacitor.isNativePlatform()) {
    return createSnapshot('granted', 'granted', 'unavailable', 'granted')
  }

  const [cameraResult, contacts, notificationResult] =
    await Promise.allSettled([
      Camera.checkPermissions(),
      checkContactsPermission(),
      PushNotifications.checkPermissions(),
    ])

  const camera =
    cameraResult.status === 'fulfilled'
      ? cameraResult.value.camera
      : 'unavailable'
  const photos =
    cameraResult.status === 'fulfilled'
      ? cameraResult.value.photos
      : 'unavailable'
  const contactStatus =
    contacts.status === 'fulfilled' ? contacts.value : 'unavailable'
  const notifications =
    notificationResult.status === 'fulfilled'
      ? notificationResult.value.receive
      : 'unavailable'

  return createSnapshot(camera, photos, contactStatus, notifications)
}

export async function requestAllAppPermissions() {
  if (!Capacitor.isNativePlatform()) return checkAppPermissions()

  await Camera.requestPermissions({
    permissions: ['camera', 'photos'],
  })

  await Promise.allSettled([
    requestContactsPermission(),
    PushNotifications.requestPermissions(),
  ])

  return checkAppPermissions()
}

export async function openAppSettings() {
  if (!Capacitor.isNativePlatform()) return false

  const platform = Capacitor.getPlatform()

  try {
    if (platform === 'ios') {
      globalThis.location.href = 'app-settings:'
      return true
    }

    if (platform === 'android') {
      globalThis.location.href =
        'intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;end'
      return true
    }
  } catch {
    return false
  }

  return false
}
