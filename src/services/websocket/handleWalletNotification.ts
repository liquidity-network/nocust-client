import {
  parseDeposit, parseRegistration, parseTransaction, parseWalletState, parseSwapCancellation, parseSwapFinalization,
} from '../operator/parsers' // prettier-ignore
import { SyncWalletEvent, syncWallet } from '../../wallet/syncWallet'
import { websocket, WSEventType } from '.'
import { getWallet } from '../../wallet'
import { payloadValidators } from '../operator/validators'

export async function handleWalletNotification(
  address: string,
  token: string,
  type: string,
  data: any,
) {
  console.log('==> incoming ws message:', type)
  switch (type) {
    case 'REGISTERED_WALLET': {
      if (payloadValidators.isValidating) payloadValidators.validateWalletRegistration(data)

      websocket.events.emit(
        websocket.defineEvent(WSEventType.REGISTRATION_CONFIRMATION, address, token),
        {
          address,
          token,
          registration: parseRegistration(data),
        },
      )
      break
    }

    case 'CONFIRMED_DEPOSIT': {
      if (payloadValidators.isValidating) payloadValidators.validateDeposit(data)

      try {
        const wallet = getWallet(address, token)
        if (wallet) {
          await syncWallet(wallet, SyncWalletEvent.SYNC_DEPOSITS, [parseDeposit(data)])
        }
      } catch (e) {
        console.log('[INTERNAL] Error syncing incoming deposit', e)
      }

      websocket.events.emit(
        websocket.defineEvent(WSEventType.DEPOSIT_CONFIRMATION, address, token),
        data,
      )
      break
    }

    case 'CHECKPOINT_CREATED': {
      if (payloadValidators.isValidating) payloadValidators.validateWalletState(data)

      try {
        const wallet = getWallet(address, token)
        if (wallet) {
          await syncWallet(wallet, SyncWalletEvent.INCREMENT_EON, parseWalletState(data))
        }
      } catch (e) {
        console.log('[INTERNAL] Error syncing wallet on checkpoint creation', e)
      }

      websocket.events.emit(
        websocket.defineEvent(WSEventType.CHECKPOINT_CREATED, address, token),
        data,
      )
      break
    }

    case 'TRANSFER_CONFIRMATION':
    case 'SWAP_CONFIRMATION':
    case 'MATCHED_SWAP': {
      if (payloadValidators.isValidating) payloadValidators.validateTransaction(data)
      const payload = parseTransaction(data)

      try {
        const wallet = getWallet(address, token)
        if (wallet) {
          await syncWallet(wallet, SyncWalletEvent.SYNC_TRANSACTIONS, { payloads: [payload] })
        }
      } catch (e) {
        console.log('[INTERNAL] Error syncing wallet on transfer update', e)
      }

      const eventType =
        type === 'MATCHED_SWAP' ? WSEventType.SWAP_MATCH : WSEventType.TRANSFER_CONFIRMATION

      websocket.events.emit(
        websocket.defineEvent(eventType, payload.recipient.address, payload.recipient.token),
        payload,
      )
      break
    }

    case 'SWAP_CANCELLATION': {
      if (payloadValidators.isValidating) payloadValidators.validateSwapCancellation(data)

      const payload = parseSwapCancellation(data)
      const wallet = getWallet(address, token)
      if (wallet) {
        try {
          await syncWallet(wallet, SyncWalletEvent.SYNC_SWAP_CANCELLATION, payload)
        } catch (e) {
          console.log('[INTERNAL] Error syncing wallet on swap cancellation', e)
        }
      }

      websocket.events.emit(
        websocket.defineEvent(WSEventType.SWAP_CANCELLATION, address, token),
        data,
      )
      break
    }
    case 'SWAP_FINALIZATION': {
      if (payloadValidators.isValidating) payloadValidators.validateSwapFinalization(data)

      const payload = parseSwapFinalization(data)
      const wallet = getWallet(address, token)
      if (wallet) {
        try {
          await syncWallet(wallet, SyncWalletEvent.SYNC_SWAP_FINALIZATION, payload)
        } catch (e) {
          console.log('[INTERNAL] Error syncing wallet on swap cancellation', e)
        }
      }

      websocket.events.emit(
        websocket.defineEvent(WSEventType.SWAP_FINALIZATION, address, token),
        data,
      )
      break
    }
  }
}
