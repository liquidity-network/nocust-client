import BigNumber from 'bignumber.js'
import { Wallet } from '../wallet'
import {
  transactionToMerkleTree,
  SwapHashConfig,
  hashSwap,
  Transaction,
  getSwapEonCount,
} from '../wallet/transaction'
import { SWAP_COUNT, BN_ZERO, BN_2_256_MINUS_1, EMPTY_HASH } from '../constants'
import { ActiveState, hashActiveState } from '../wallet/activeState'
import { constructMerkleTree } from '../wallet/merkleTree'
import { BalanceMarker, hashBalanceMarker } from '../wallet/balanceMarker'
import { Signature } from '../wallet/signature'
import { blockchain } from './blockchain'

type CreateSwapOrderSignaturesConfig = {
  creditWallet: Wallet
  debitWallet: Wallet
  creditAmount: BigNumber
  debitAmount: BigNumber
  nonce: BigNumber
}
type OrderSignatures = {
  creditActiveStateSignatures: Signature[]
  debitActiveStateSignatures: Signature[]
  fulfillmentActiveStateSignatures: Signature[]
  creditBalanceSignatures: Signature[]
  debitBalanceSignatures: Signature[]
}
export async function createSwapOrderSignatures(
  config: CreateSwapOrderSignaturesConfig,
): Promise<OrderSignatures> {
  const { creditAmount, debitAmount, creditWallet, debitWallet, nonce } = config
  let creditStartingBalance = creditWallet.currentEon.initialBalanceAllotment
  let debitStartingBalance = debitWallet.currentEon.initialBalanceAllotment
  const eon = debitWallet.currentEon.eon
  const creditActiveStates = []
  const debitActiveStates = []
  const fulfillmentActiveStates = []
  const creditBalanceMarkers = []
  const debitBalanceMarkers = []
  let debitTransactionSetNodes = debitWallet.currentEon.activeTransactions.map(t =>
    transactionToMerkleTree(t, debitWallet),
  )
  let creditTransactionSetNodes = creditWallet.currentEon.activeTransactions.map(t =>
    transactionToMerkleTree(t, creditWallet),
  )
  let fulfilledTransactionSetNodes = creditWallet.currentEon.activeTransactions.map(t =>
    transactionToMerkleTree(t, creditWallet),
  )
  for (let i = 0; i < SWAP_COUNT; i++) {
    if (i !== 0) {
      creditStartingBalance = BN_ZERO
      debitStartingBalance = debitAmount
      debitTransactionSetNodes = []
      creditTransactionSetNodes = []
      fulfilledTransactionSetNodes = []
    }
    const creditSwap: SwapHashConfig = {
      amount: debitAmount,
      amountSwapped: creditAmount,
      creditToken: creditWallet.token,
      debitToken: debitWallet.token,
      nonce,
      startingBalance: creditStartingBalance,
      trailIdentifier: creditWallet.trailIdentifier,
    }
    const debitSwap: SwapHashConfig = { ...creditSwap, startingBalance: debitStartingBalance }
    const fulfilledSwap: SwapHashConfig = { ...creditSwap, startingBalance: BN_2_256_MINUS_1 }

    creditTransactionSetNodes.push({ height: 0, hash: hashSwap(creditSwap) })
    debitTransactionSetNodes.push({ height: 0, hash: hashSwap(debitSwap) })
    fulfilledTransactionSetNodes.push({ height: 0, hash: hashSwap(fulfilledSwap) })

    let { spent: creditSpent, gained: creditGained } = creditWallet.currentEon.spentAndGained
    let { spent: debitSpent, gained: debitGained } = debitWallet.currentEon.spentAndGained

    if (i > 0) {
      creditSpent = BN_ZERO
      creditGained = BN_ZERO
      debitSpent = BN_ZERO
      debitGained = BN_ZERO
    }
    const creditActiveState: ActiveState = {
      ...creditWallet.currentEon.activeState,
      spent: creditSpent,
      gained: creditGained,
      eon: eon + i,
      transactionSetHash: constructMerkleTree(creditTransactionSetNodes).hash,
    }
    const debitActiveState: ActiveState = {
      ...debitWallet.currentEon.activeState,
      spent: debitSpent.plus(debitAmount),
      gained: debitGained,
      eon: eon + i,
      transactionSetHash: constructMerkleTree(debitTransactionSetNodes).hash,
    }
    const fulfillmentActiveState: ActiveState = {
      ...creditWallet.currentEon.activeState,
      spent: creditSpent,
      gained: creditGained.plus(creditAmount),
      eon: eon + i,
      transactionSetHash: constructMerkleTree(fulfilledTransactionSetNodes).hash,
    }
    const creditBalanceMarker: BalanceMarker = {
      address: creditWallet.address,
      balance: BN_ZERO.toFixed(0),
      eon: eon + i,
      token: creditWallet.token,
    }
    const debitBalanceMarker: BalanceMarker = {
      address: debitWallet.address,
      balance: BN_ZERO.toFixed(0),
      eon: eon + i,
      token: debitWallet.token,
    }

    creditActiveStates.push(hashActiveState(creditActiveState))
    debitActiveStates.push(hashActiveState(debitActiveState))
    fulfillmentActiveStates.push(hashActiveState(fulfillmentActiveState))
    creditBalanceMarkers.push(hashBalanceMarker(creditBalanceMarker))
    debitBalanceMarkers.push(hashBalanceMarker(debitBalanceMarker))
  }
  const swapWalletAddress = debitWallet.address
  const [
    creditActiveStateSignatures,
    debitActiveStateSignatures,
    creditBalanceSignatures,
    debitBalanceSignatures,
    fulfillmentActiveStateSignatures,
  ] = await Promise.all([
    Promise.all([...creditActiveStates.map(hash => blockchain.sign(swapWalletAddress, hash))]),
    Promise.all([...debitActiveStates.map(hash => blockchain.sign(swapWalletAddress, hash))]),
    Promise.all([...creditBalanceMarkers.map(hash => blockchain.sign(swapWalletAddress, hash))]),
    Promise.all([...debitBalanceMarkers.map(hash => blockchain.sign(swapWalletAddress, hash))]),
    Promise.all([
      ...fulfillmentActiveStates.map(hash => blockchain.sign(creditWallet.address, hash)),
    ]),
  ])
  return {
    creditActiveStateSignatures,
    debitActiveStateSignatures,
    fulfillmentActiveStateSignatures,
    creditBalanceSignatures,
    debitBalanceSignatures,
  }
}

export async function createCancellationSignatures(
  debitWallet: Wallet,
  creditWallet: Wallet,
  swap: Transaction,
): Promise<{
  debitCancellationSignatures: Array<Signature>
  creditCancellationSignatures: Array<Signature>
}> {
  try {
    const debitCancellationHashes = []
    const creditCancellationHashes = []

    const creditSwapIndex = creditWallet.currentEon.transactions.findIndex(
      transaction => transaction.id === swap.id,
    )
    creditWallet.currentEon.transactions[creditSwapIndex].cancelled = true

    const { spent: debitSpent, gained: debitGained } = debitWallet.currentEon.spentAndGained
    const debitEonMatchedAmounts = debitWallet.currentEon.eonMatchedAmounts(swap)
    const debitCancellationActiveState: ActiveState = {
      ...debitWallet.currentEon.activeState,
      spent: debitSpent,
      gained: debitGained.plus(swap.amount).minus(debitEonMatchedAmounts.out),
    }

    const { spent: creditSpent, gained: creditGained } = creditWallet.currentEon.spentAndGained
    const creditCancellationActiveState: ActiveState = {
      ...creditWallet.currentEon.activeState,
      spent: creditSpent.plus(swap.amountSwapped),
      gained: creditGained.plus(swap.amountSwapped),
    }

    debitCancellationHashes.push(hashActiveState(debitCancellationActiveState))
    creditCancellationHashes.push(hashActiveState(creditCancellationActiveState))

    const swapEonCount = await getSwapEonCount(swap)

    for (let i = 1; i <= SWAP_COUNT - swapEonCount; i++) {
      const debitFutureSpentGained = BigNumber.max(
        debitSpent,
        debitGained.plus(swap.amount).minus(debitEonMatchedAmounts.out),
      ).plus(1)
      const creditFutureSpentGained = BigNumber.max(creditSpent, creditGained)
        .plus(swap.amountSwapped)
        .plus(1)

      const futureDebitCancellationActiveState: ActiveState = {
        ...debitWallet.currentEon.activeState,
        transactionSetHash: EMPTY_HASH,
        eon: swap.eon + i,
        spent: debitFutureSpentGained,
        gained: debitFutureSpentGained,
      }
      const futureCreditCancellationActiveState: ActiveState = {
        ...creditWallet.currentEon.activeState,
        transactionSetHash: EMPTY_HASH,
        eon: swap.eon + i,
        spent: creditFutureSpentGained,
        gained: creditFutureSpentGained,
      }
      debitCancellationHashes.push(hashActiveState(futureDebitCancellationActiveState))
      creditCancellationHashes.push(hashActiveState(futureCreditCancellationActiveState))
    }
    const swapWalletAddress = debitWallet.address
    const [debitCancellationSignatures, creditCancellationSignatures] = await Promise.all([
      Promise.all([
        ...debitCancellationHashes.map(hash => blockchain.sign(swapWalletAddress, hash)),
      ]),
      Promise.all([
        ...creditCancellationHashes.map(hash => blockchain.sign(swapWalletAddress, hash)),
      ]),
    ])
    return { debitCancellationSignatures, creditCancellationSignatures }
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function createFinalizationSignatures(
  creditWallet: Wallet,
  swap: Transaction,
): Promise<{
  finalizationSignatures: Array<Signature>
}> {
  try {
    const finalizationHashes: Array<string> = []
    const { spent: creditSpent, gained: creditGained } = creditWallet.currentEon.spentAndGained

    const finalizationActiveState: ActiveState = {
      ...creditWallet.currentEon.activeState,
      spent: creditSpent.plus(swap.amountSwapped),
      gained: creditGained.plus(swap.amountSwapped),
    }
    finalizationHashes.push(hashActiveState(finalizationActiveState))

    const swapEonCount = await getSwapEonCount(swap)
    for (let i = 1; i <= SWAP_COUNT - swapEonCount; i++) {
      const futureSpentGained = BigNumber.max(creditSpent, creditGained)
        .plus(swap.amountSwapped)
        .plus(1)

      const futureFinalizationActiveState: ActiveState = {
        ...creditWallet.currentEon.activeState,
        spent: futureSpentGained,
        gained: futureSpentGained,
        transactionSetHash: EMPTY_HASH,
        eon: swap.eon + i,
      }
      finalizationHashes.push(hashActiveState(futureFinalizationActiveState))
    }
    const finalizationSignatures = await Promise.all([
      ...finalizationHashes.map(hash => blockchain.sign(creditWallet.address, hash)),
    ])
    return { finalizationSignatures }
  } catch (e) {
    return Promise.reject(e)
  }
}
