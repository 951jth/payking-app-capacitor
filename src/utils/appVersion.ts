import { App } from '@capacitor/app'

export async function getAppVersion(): Promise<string> {
  try {
    const info = await App.getInfo()
    return info.version
  } catch {
    return import.meta.env.VITE_APP_VERSION ?? '0.0.0'
  }
}
