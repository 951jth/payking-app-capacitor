import { Network, type ConnectionStatus } from '@capacitor/network'

export type NetworkStatus = ConnectionStatus

export async function getNetworkStatus() {
  return Network.getStatus()
}

export async function isOnline() {
  const status = await getNetworkStatus()
  return status.connected
}

export function addNetworkStatusListener(
  listener: (status: NetworkStatus) => void,
) {
  return Network.addListener('networkStatusChange', listener)
}
