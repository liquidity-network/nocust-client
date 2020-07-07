import Web3 from 'web3'
import { BigNumber } from 'bignumber.js'

import { WalletId, Wallet } from './index'
import { BN_2_256_MINUS_1 } from '../constants'
import { remove0x } from '../helpers/utils'
import { ActiveState } from './activeState'
import { MerkleTree } from './merkleTree'
import { operator } from '../services/operator'

export interface Transaction {
  id: number
  txId: string
  amount: BigNumber
  amountSwapped: BigNumber
  sender: WalletId
  recipient: WalletId
  nonce: BigNumber
  passiveMarker: BigNumber
  eon: number
  time: number
  senderActiveState: ActiveState
  recipientActiveState?: ActiveState
  senderCancellationActiveState?: ActiveState
  recipientCancellationActiveState?: ActiveState
  senderFinalizationActiveState?: ActiveState
  recipientFinalizationActiveState?: ActiveState
  recipientFulfillmentActiveState?: ActiveState
  swap: boolean
  matchedAmounts?: MatchedAmounts
  complete: boolean
  voided: boolean
  processed?: boolean
  cancelled?: boolean
  appended?: boolean
}

export interface MatchedAmounts {
  in: BigNumber
  out: BigNumber
}
export type TransferHashConfig = {
  passiveMarker?: BigNumber
  nonce: BigNumber
  senderAddress: string
  recipientAddress: string
  amount: BigNumber
  recipientTrailIdentifier: number
  isOutgoing: boolean
}

export type SwapHashConfig = {
  creditToken: string
  debitToken: string
  trailIdentifier: number
  amount: BigNumber
  amountSwapped: BigNumber
  startingBalance: BigNumber
  nonce: BigNumber
}

export type SwapFreezeHashConfig = {
  creditToken: string
  debitToken: string
  nonce: BigNumber
}

export function hashTransfer(config: TransferHashConfig) {
  const { soliditySha3 } = Web3.utils
  const passiveMarker = config.passiveMarker || BN_2_256_MINUS_1

  console.log('passiveMarker', passiveMarker)

  const transferTag = new BigNumber(
    remove0x(
      soliditySha3(
        { t: 'uint256', v: passiveMarker.toFixed(0) },
        { t: 'uint256', v: config.nonce.toFixed(0) },
      ).toString(),
    ),
    16,
  )

  return soliditySha3(
    {
      t: 'bytes32',
      v: soliditySha3({
        t: 'address',
        v: config.isOutgoing ? config.recipientAddress : config.senderAddress,
      }),
    },
    { t: 'uint256', v: config.amount.toFixed(0) },
    { t: 'uint64', v: config.recipientTrailIdentifier.toString() },
    { t: 'uint256', v: transferTag.toFixed(0) },
  ).toString()
}

export function hashSwap(config: SwapHashConfig) {
  const { soliditySha3 } = Web3.utils
  return soliditySha3(
    { type: 'bytes32', value: soliditySha3({ type: 'address', value: config.debitToken }) },
    { type: 'bytes32', value: soliditySha3({ type: 'address', value: config.creditToken }) },
    { type: 'uint64', value: config.trailIdentifier.toString() },
    { type: 'uint256', value: config.amount.toFixed(0) },
    { type: 'uint256', value: config.amountSwapped.toFixed(0) },
    { type: 'uint256', value: config.startingBalance.toFixed(0) },
    { type: 'uint256', value: config.nonce.toFixed(0) },
  ).toString()
}

export function hashSwapFreezing(config: SwapFreezeHashConfig) {
  const { soliditySha3 } = Web3.utils
  return soliditySha3(
    { type: 'bytes32', value: soliditySha3({ type: 'address', value: config.debitToken }) },
    { type: 'bytes32', value: soliditySha3({ type: 'address', value: config.creditToken }) },
    { type: 'uint256', value: config.nonce.toFixed(0) },
  ).toString()
}

export function getTransactionActiveState(
  transaction: Transaction,
  isOutgoing: boolean,
): ActiveState {
  // Transaction is a swap
  if (transaction.swap) {
    if (isOutgoing) {
      return transaction.senderCancellationActiveState
        ? transaction.senderCancellationActiveState
        : transaction.senderActiveState
    }
    if (transaction.recipientFinalizationActiveState) {
      return transaction.recipientFinalizationActiveState
    }
    if (transaction.recipientCancellationActiveState) {
      return transaction.recipientCancellationActiveState
    }
    if (transaction.complete) {
      return transaction.recipientFulfillmentActiveState
    }
    return transaction.recipientActiveState
  }

  // Transaction is a normal transfer
  if (isOutgoing) {
    return transaction.senderActiveState
  }

  return transaction.recipientActiveState
}

export function transactionToMerkleTree(
  transaction: Transaction,
  wallet: Wallet,
  lastTransaction?: Transaction,
): MerkleTree {
  let passiveMarkerValue
  if (lastTransaction) {
    passiveMarkerValue =
      transaction.id === lastTransaction.id ? BN_2_256_MINUS_1 : transaction.passiveMarker
  } else {
    passiveMarkerValue = transaction.passiveMarker
  }

  const isOutgoing =
    transaction.sender.address === wallet.address && transaction.sender.token === wallet.token
  if (transaction.swap) {
    return {
      height: 0,
      hash: hashSwap({
        amount: transaction.amount,
        amountSwapped: transaction.amountSwapped,
        nonce: transaction.nonce,
        debitToken: transaction.sender.token,
        creditToken: transaction.recipient.token,
        startingBalance:
          !isOutgoing && (transaction.complete || transaction.cancelled)
            ? BN_2_256_MINUS_1
            : // TODO: Should take the starting balance from the transaction.
              wallet.currentEon.initialBalanceAllotment,
        trailIdentifier: transaction.recipient.trailIdentifier,
      }),
    }
  }
  return {
    height: 0,
    hash: hashTransfer({
      amount: transaction.amount,
      nonce: transaction.nonce,
      recipientAddress: transaction.recipient.address,
      senderAddress: transaction.sender.address,
      recipientTrailIdentifier: transaction.recipient.trailIdentifier,
      passiveMarker: passiveMarkerValue,
      isOutgoing,
    }),
  }
}

export async function getSwapEonCount(swap: Transaction) {
  try {
    const swaps = await operator.getTransfers({ txId: swap.txId })
    const eonCount = swaps.reduce((count, s) => {
      if (s.eon <= swap.eon) {
        return count + 1
      }
      return count
    }, 0)
    return eonCount
  } catch (e) {
    return Promise.reject(e)
  }
}
