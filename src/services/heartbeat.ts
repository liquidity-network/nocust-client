// Runs periodically via setInterval
import { websocket } from './websocket'
import { storage } from './storage'

let pingTimer: ReturnType<typeof setInterval>

async function heartbeat() {
  // Need to ping server so CloudFlare does not break connection
  websocket.send('ping', {})

  await storage.storeQueuedWallets()
}

export function startHeartbeat() {
  pingTimer = setInterval(heartbeat, 10000)
}

export function stopHeartbeat() {
  if (pingTimer) clearInterval(pingTimer)
}
