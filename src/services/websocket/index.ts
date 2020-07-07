import { EventEmitter } from '../../helpers/eventEmitter'
import { handleWalletNotification } from './handleWalletNotification'
import { handleTokenPairNotification } from './handleTokenPairNotification'
import { detectEnvironment } from '../../helpers/utils'

export enum WSEventType {
  REGISTRATION_CONFIRMATION = 'REGISTRATION_CONFIRMATION',
  DEPOSIT_CONFIRMATION = 'DEPOSIT_CONFIRMATION',
  CHECKPOINT_CREATED = 'CHECKPOINT_CREATED',
  TRANSFER_CONFIRMATION = 'TRANSFER_CONFIRMATION',
  SWAP_MATCH = 'SWAP_MATCH',
  SWAP_CANCELLATION = 'SWAP_CANCELLATION',
  SWAP_FINALIZATION = 'SWAP_FINALIZATION',
}

let ws: WebSocket

let reconnectInterval = 500 // half second
const startingSendQueue: Array<{ command: WSCommand; args?: Object }> = []
function init(url: string) {
  if (detectEnvironment() === 'node') (global as any).WebSocket = require('ws')

  createConnection(url)
}

function createConnection(url: string) {
  ws = new WebSocket(getOperatorWebSocketUrl(url))

  ws.onopen = () => {
    reconnectInterval = 500

    // Send all messages being queued before connection was open
    while (startingSendQueue.length > 0) {
      const record = startingSendQueue.shift()
      send(record.command, record.args)
    }
  }

  ws.onclose = () => {
    console.log('ws connection is dropped, trying to reconnect...')
    setTimeout(() => createConnection(url), reconnectInterval)
  }

  ws.onmessage = async (event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data)
      if (payload.type === 'notification') {
        const { type, data } = payload.data.data
        const [streamName, param1, param2] = payload.data.type.split('/')
        if (streamName === 'wallet') {
          await handleWalletNotification('0x' + param2, '0x' + param1, type, data)
        } else if (streamName === 'tokenpair') {
          // TODO Implement
          await handleTokenPairNotification({} as any)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export type WSCommand = 'subscribe' | 'unsubscribe' | 'get' | 'ping' | 'ack'
function send(command: WSCommand, args?: Object) {
  if (ws.readyState === WebSocket.CONNECTING) {
    startingSendQueue.push({ command, args })
  } else {
    ws.send(JSON.stringify({ op: command, args }))
  }
}

function shutdown() {
  ws.onmessage = null
  ws.onclose = null
  ws.close()

  websocket.events.removeEventAllListeners()
}

function getOperatorWebSocketUrl(url: string): string {
  url += url.endsWith('/') ? 'ws/' : '/ws/'

  if (url.startsWith('https://')) {
    return 'wss://' + url.slice(8)
  } else if (url.startsWith('http://')) {
    return 'ws://' + url.slice(7)
  } else if (url.startsWith('ws://') || url.startsWith('wss://')) {
    return url
  } else {
    throw Error('Unknown protocol')
  }
}

const defineEvent = (event: WSEventType, address: string, token: string) =>
  event + '/' + address + '/' + token

type WaitForEventConfig = {
  event: WSEventType
  address: string
  token: string
  timeout?: number
}
async function waitForEvent(config: WaitForEventConfig): Promise<any> {
  const { event, address, token, timeout = 30 } = config
  return new Promise((resolve, reject) => {
    const unsubscribe = websocket.events.once(defineEvent(event, address, token), (data: any) => {
      if (failTimer) clearTimeout(failTimer)
      resolve(data)
    })

    const failTimer = setTimeout(() => {
      unsubscribe()
      reject(new Error('[INTERNAL] Waiting for websocket message timeout'))
    }, timeout * 1000)
  })
}

export const websocket = {
  events: new EventEmitter<string>(),
  init,
  shutdown,
  send,
  waitForEvent,
  defineEvent,
}
