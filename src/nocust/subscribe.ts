import { store } from '../store'
import { websocket, WSEventType } from '../services/websocket'
import { TransactionPayload } from '../services/operator/payloads'

export enum NCEventType {
  TRANSFER_CONFIRMATION = 'TRANSFER_CONFIRMATION',
}

export type SubscribeConfig = {
  address: string
  token?: string
  event: NCEventType
  callback: (data: Object) => void
}
export default function subscribe(config: SubscribeConfig): Function {
  let { address, token, event, callback } = config

  if (token == null) token = store.contractAddress

  if (event === NCEventType.TRANSFER_CONFIRMATION) {
    return websocket.events.on(
      websocket.defineEvent(WSEventType.TRANSFER_CONFIRMATION, address, token),
      (payload: TransactionPayload) => {
        if (payload.recipient.address === address && payload.recipient.token === token) {
          callback(payload)
        }
      },
    )
  } else {
    throw new Error('Invalid event type, please use one of NCEventType')
  }
}
