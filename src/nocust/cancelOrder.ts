import { store } from '../store'
import { NCError, NCErrorCode } from '../helpers/errors'
import { operator } from '../services/operator'
import { hashSwapFreezing } from '../wallet/transaction'
import { blockchain } from '../services/blockchain'
import { createCancellationSignatures } from '../services/swaps'
import { syncWallet, SyncWalletEvent } from '../wallet/syncWallet'
import getTransfer from './getTransfer'
import getWallet from './getWallet'

export default async function cancelOrder(address: string, id: number): Promise<void> {
  try {
    if (!store.swapWallets.has(address)) {
      return Promise.reject(
        new NCError(
          NCErrorCode.NO_TRADING_SETUP,
          'Please make sure setupTrading() is called before canceling orders',
        ),
      )
    }
    const swap = await getTransfer(id)
    const debitWallet = await getWallet(swap.sender.address, swap.sender.token, address)
    const creditWallet = await getWallet(swap.recipient.address, swap.recipient.token, address)

    const isPending = !swap.complete && !swap.senderCancellationActiveState && !swap.voided
    if (!isPending) {
      return Promise.reject(
        new NCError(NCErrorCode.CAN_NOT_CANCEL_SWAP, `Swap with id ${swap.id} is not pending`),
      )
    }
    if (swap.eon !== debitWallet.currentEon.eon) {
      return Promise.reject(
        new NCError(
          NCErrorCode.CAN_NOT_CANCEL_SWAP,
          `Swap with id ${swap.id} is not found in the current eon`,
        ),
      )
    }

    // Make sure swap is not already frozen
    if (!swap.cancelled) {
      const swapFreezeHash = hashSwapFreezing({
        debitToken: swap.sender.token,
        creditToken: swap.recipient.token,
        nonce: swap.nonce,
      })
      const freezingSignature = await blockchain.sign(debitWallet.address, swapFreezeHash)
      const swapFreezePayload = await operator.sendSwapFreezing(id, freezingSignature)
      await syncWallet(creditWallet, SyncWalletEvent.SYNC_SWAP_FREEZE, swapFreezePayload)
      await syncWallet(debitWallet, SyncWalletEvent.SYNC_SWAP_FREEZE, swapFreezePayload)
    }

    const {
      creditCancellationSignatures,
      debitCancellationSignatures,
    } = await createCancellationSignatures(debitWallet, creditWallet, swap)

    const swapCancellationPayload = await operator.sendSwapCancellation(
      swap.id,
      creditCancellationSignatures,
      debitCancellationSignatures,
    )

    await syncWallet(creditWallet, SyncWalletEvent.SYNC_SWAP_CANCELLATION, swapCancellationPayload)
    await syncWallet(debitWallet, SyncWalletEvent.SYNC_SWAP_CANCELLATION, swapCancellationPayload)
  } catch (e) {
    return Promise.reject(e)
  }
}
