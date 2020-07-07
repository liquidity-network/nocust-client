import { websocket } from '../services/websocket'
import { stopHeartbeat } from '../services/heartbeat'
import { storage } from '../services/storage'

export default async function shutdown(): Promise<void> {
  stopHeartbeat()

  websocket.shutdown()

  await storage.storeQueuedWallets()
}
