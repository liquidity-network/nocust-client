import BigNumber from 'bignumber.js'

import { DepositPayload, TransactionPayload, ActiveStatePayload } from './payloads'
import { Deposit } from '../../wallet/parentChainTxs'
import { Transaction } from '../../wallet/transaction'
import { ActiveState } from 'wallet/activeState'
import { BN_ZERO } from '../../constants'
import { WalletId } from '../../wallet'
import { createSignature } from '../../wallet/signature'
import { store } from '../../store'

export const transformDepositFromServer = (data: DepositPayload): Deposit => ({
  txId: data.txId,
  block: data.block,
  eon: data.eon,
  amount: new BigNumber(data.amount),
})

export const transformTransactionFromServer = (
  transactionData: TransactionPayload,
): Transaction => {
  return {
    id: transactionData.id,
    txId: transactionData.txId,
    amount: new BigNumber(transactionData.amount),
    amountSwapped: transactionData.amountSwapped
      ? new BigNumber(transactionData.amountSwapped)
      : null,
    sender: transactionData.wallet,
    recipient: transactionData.recipient,
    nonce: new BigNumber(transactionData.nonce),
    passiveMarker: new BigNumber(transactionData.passiveMarker),
    eon: transactionData.eon,
    time: transactionData.time,
    // TODO: remove second condition when endpoint is fixed
    swap: transactionData.swap || !!transactionData.amountSwapped,
    complete: transactionData.complete,
    voided: transactionData.voided,
    processed: transactionData.processed,
    cancelled: transactionData.cancelled,
    appended: transactionData.appended,
    matchedAmounts: transactionData.matchedAmounts
      ? {
          in: new BigNumber(transactionData.matchedAmounts.matchedIn),
          out: new BigNumber(transactionData.matchedAmounts.matchedOut),
        }
      : { in: BN_ZERO, out: BN_ZERO },
    senderActiveState: transformActiveStateFromServer(
      transactionData.wallet,
      transactionData.eon,
      transactionData.senderActiveState,
    ),
    recipientActiveState: transformActiveStateFromServer(
      transactionData.wallet,
      transactionData.eon,
      transactionData.recipientActiveState,
    ),
    senderCancellationActiveState: transformActiveStateFromServer(
      transactionData.wallet,
      transactionData.eon,
      transactionData.senderCancellationActiveState,
    ),
    recipientCancellationActiveState: transformActiveStateFromServer(
      transactionData.wallet,
      transactionData.eon,
      transactionData.recipientCancellationActiveState,
    ),
    senderFinalizationActiveState: transformActiveStateFromServer(
      transactionData.wallet,
      transactionData.eon,
      transactionData.senderFinalizationActiveState,
    ),
    recipientFinalizationActiveState: transformActiveStateFromServer(
      transactionData.wallet,
      transactionData.eon,
      transactionData.recipientFinalizationActiveState,
    ),
    recipientFulfillmentActiveState: transformActiveStateFromServer(
      transactionData.wallet,
      transactionData.eon,
      transactionData.recipientFulfillmentActiveState,
    ),
  }
}

export const transformActiveStateFromServer = (
  wallet: WalletId,
  eon: number,
  acitveStateData: ActiveStatePayload,
): ActiveState => {
  if (!acitveStateData) {
    return null
  }
  const walletSignature = acitveStateData.walletSignature
    ? createSignature(wallet.address, acitveStateData.txSetHash, acitveStateData.walletSignature)
    : null

  const operatorSignature = acitveStateData.operatorSignature
    ? createSignature(
        store.contractOwner,
        acitveStateData.txSetHash,
        acitveStateData.operatorSignature,
      )
    : null
  return {
    address: wallet.address,
    token: wallet.token,
    eon: eon,
    trailIdentifier: wallet.trailIdentifier,
    spent: new BigNumber(acitveStateData.updatedSpendings),
    gained: new BigNumber(acitveStateData.updatedGains),
    transactionSetHash: acitveStateData.txSetHash,
    operatorSignature,
    walletSignature,
  }
}
