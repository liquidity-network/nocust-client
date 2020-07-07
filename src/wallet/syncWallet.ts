import BigNumber from 'bignumber.js'

import { hashActiveState } from './activeState'
import { blockchain } from '../services/blockchain'
import { operator } from '../services/operator'
import {
  DepositPayload, WalletStatePayload, RegistrationPayload, TransactionPayload, SwapCancellationPayload, SwapFinalizationPayload, SwapFreezePayload,
} from '../services/operator/payloads' // prettier-ignore
import {
  transformDepositFromServer, transformTransactionFromServer, transformActiveStateFromServer,
} from '../services/operator/transformers' // prettier-ignore
import { Eon } from './eon'
import { nocust } from '../nocust'
import { fillWalletRegistration, updateWallet, Wallet, WalletId } from '.'
import { EMPTY_HASH } from '../constants'

export enum SyncWalletEvent {
  RECONSTRUCT = 'RECONSTRUCT',
  FULL_SYNC = 'FULL_SYNC',
  INCREMENT_EON = 'INCREMENT_EON',
  SYNC_DEPOSITS = 'SYNC_DEPOSITS',
  SYNC_TRANSACTIONS = 'SYNC_TRANSACTIONS',
  SYNC_SWAP_CANCELLATION = 'SYNC_SWAP_CANCELLATION',
  SYNC_SWAP_FINALIZATION = 'SYNC_SWAP_FINALIZATION',
  SYNC_SWAP_FREEZE = 'SYNC_SWAP_FREEZE',
}

export async function syncWallet(
  wallet: Wallet,
  event: SyncWalletEvent,
  data?: any,
): Promise<void> {
  try {
    if (!blockchain.isPrivateKeyAdded(wallet.address)) {
      return
    }
    switch (event) {
      case SyncWalletEvent.RECONSTRUCT:
        await reconstruct(wallet)
        break
      case SyncWalletEvent.FULL_SYNC:
        await syncFull(wallet)
        break
      case SyncWalletEvent.INCREMENT_EON:
        incrementEon(wallet, data)
        break
      case SyncWalletEvent.SYNC_DEPOSITS:
        syncDeposits(wallet, data)
        break
      case SyncWalletEvent.SYNC_TRANSACTIONS:
        syncTransactions(wallet, data)
        break
      case SyncWalletEvent.SYNC_SWAP_CANCELLATION:
        syncSwapCancellation(wallet, data)
        break
      case SyncWalletEvent.SYNC_SWAP_FINALIZATION:
        syncSwapFinalization(wallet, data)
        break
      case SyncWalletEvent.SYNC_SWAP_FREEZE:
        syncSwapFreeze(wallet, data)
        break
    }
    updateWallet(wallet)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function reconstruct(wallet: Wallet) {
  try {
    const { address, token } = wallet
    const eon = await nocust.getEon()
    const walletState = await operator.fetchWalletState({ address, token, eon })

    syncRegistration(wallet, walletState.registration)

    await syncFull(wallet, walletState)
  } catch (e) {
    console.log(e)
    return Promise.reject(e)
  }
}

async function syncFull(wallet: Wallet, walletState?: WalletStatePayload) {
  const { address, token, currentEon } = wallet
  const currentEonNumber = await nocust.getEon()
  if (!walletState) {
    walletState = await operator.fetchWalletState({ address, token, eon: currentEonNumber })
  }

  // log('syncFull state wallet', wallet)
  // log('syncFull state walletState', walletState)
  // console.log('wallet current eon', currentEon.eon, 'operator eon', operatorEonData?.eon)

  if (currentEonNumber === wallet.registrationEon) {
    // Registration eon is still in progress, nothing to sync so far
  } else if (currentEonNumber - currentEon.eon > 1) {
    console.log(
      '[WARNING] You missed eon synchronization, fetching wallet from operator without integrity check',
    )
    await setNewEons(wallet, walletState, currentEonNumber)
  } else if (currentEonNumber === currentEon.eon) {
    // Current eon, seems it's fine
  } else {
    incrementEon(wallet, walletState)
  }

  syncDeposits(wallet, walletState.deposits)
  // syncWithdrawalRequests
  // syncWithdrawals
  syncTransactions(wallet, { payloads: walletState.transactions })
}

function returnEon(wallet: Wallet, walletState: WalletStatePayload) {
  if (!walletState.merkleProof) {
    console.log('No data to increment eon')
    return
  }
  const operatorEonData = walletState.merkleProof
  const newEon = new Eon(wallet, operatorEonData.eon)

  // TODO Check incoming operator eon data

  newEon.membershipProofPath = operatorEonData.membershipChain

  newEon.accountProof.left = new BigNumber(operatorEonData.left)
  newEon.accountProof.right = new BigNumber(operatorEonData.right)
  newEon.accountProof.path = operatorEonData.allotmentChain
  newEon.accountProof.pathValues = operatorEonData.values.map(v => new BigNumber(v))

  return newEon
}

async function setNewEons(
  wallet: Wallet,
  walletState: WalletStatePayload,
  currentEonNumber: number,
) {
  try {
    const { address, token } = wallet
    const previousWalletState = await operator.fetchWalletState({
      address,
      token,
      eon: currentEonNumber - 1,
    })
    wallet.previousEon = returnEon(wallet, previousWalletState)
    syncTransactions(wallet, { payloads: previousWalletState.transactions }, false)
    wallet.currentEon = returnEon(wallet, walletState)
  } catch (e) {
    console.log(e)
    return Promise.reject(e)
  }
}

function incrementEon(wallet: Wallet, walletState: WalletStatePayload) {
  // log('incrementEon', wallet)
  // log('incoming wallet state', walletState)
  if (!walletState.merkleProof) {
    console.log('No data to increment eon')
    return
  }

  const operatorEonData = walletState.merkleProof
  if (
    wallet.currentEon.eon !== wallet.registrationEon &&
    wallet.currentEon.eon >= operatorEonData.eon
  ) {
    console.log('[ERROR] Local data has already been updated for new eon')
    return
  }

  const newEon = returnEon(wallet, walletState)

  // FIXME: The current eon for the wallet might not always be the previous eon
  // Problem: User has a stored wallet older than 2 eons.
  // Solution: should fetch current and previous eons in full sync.
  wallet.previousEon = wallet.currentEon
  wallet.currentEon = newEon

  syncDeposits(wallet, walletState.deposits)
  syncTransactions(wallet, { payloads: walletState.transactions })
}

function syncDeposits(wallet: Wallet, deposits: DepositPayload[]) {
  const { currentEon } = wallet
  deposits.forEach(deposit => {
    const existingDeposit = currentEon.deposits.find(d => d.txId === deposit.txId)
    if (!existingDeposit && deposit.eon === currentEon.eon) {
      currentEon.deposits.push(transformDepositFromServer(deposit))
    }
  })
}

function syncTransactions(
  wallet: Wallet,
  data: { payloads: TransactionPayload[] },
  isCurrentEon: boolean = true,
) {
  const walletPayload: Eon = isCurrentEon ? wallet.currentEon : wallet.previousEon
  data.payloads.forEach(transactionPayload => {
    if (transactionPayload.eon === walletPayload.eon) {
      // TODO Check if transfer is valid
      const txIndex = walletPayload.transactions.findIndex(t => t.id === transactionPayload.id)
      if (txIndex === -1) {
        walletPayload.transactions.push(transformTransactionFromServer(transactionPayload))
      } else {
        const transaction = walletPayload.transactions[txIndex]
        walletPayload.transactions[txIndex] = {
          ...transaction,
          ...transformTransactionFromServer(transactionPayload),
        }
      }
    }
  })
}

function syncRegistration(wallet: Wallet, registration: RegistrationPayload) {
  const { address, token } = wallet
  const hash = hashActiveState({
    token,
    address,
    eon: registration.eon,
    trailIdentifier: 0,
    transactionSetHash: EMPTY_HASH,
    spent: new BigNumber(0),
    gained: new BigNumber(0),
  })

  const isRegistrationValid = blockchain.validateSignature(
    hash,
    registration.walletSignature,
    address,
  )

  if (isRegistrationValid) {
    fillWalletRegistration(wallet, { ...registration, hash })
  } else {
    throw new Error('[INTERNAL] Registration signature from operator does not match')
  }
}

function syncSwapCancellation(wallet: Wallet, swapCancellation: SwapCancellationPayload) {
  const swapIndex = wallet.currentEon.transactions.findIndex(
    transaction => transaction.id === swapCancellation.id,
  )
  if (swapIndex !== -1) {
    const walletId: WalletId = {
      address: wallet.address,
      token: wallet.token,
      trailIdentifier: wallet.trailIdentifier,
    }
    const { senderCancellationActiveState, recipientCancellationActiveState } = swapCancellation
    wallet.currentEon.transactions[swapIndex] = {
      ...wallet.currentEon.transactions[swapIndex],
      senderCancellationActiveState: transformActiveStateFromServer(
        walletId,
        wallet.currentEon.eon,
        senderCancellationActiveState,
      ),
      recipientCancellationActiveState: wallet.currentEon.transactions[
        swapIndex
      ].recipientCancellationActiveState = transformActiveStateFromServer(
        walletId,
        wallet.currentEon.eon,
        recipientCancellationActiveState,
      ),
      cancelled: true,
    }
  }
}

function syncSwapFinalization(wallet: Wallet, swapFinalization: SwapFinalizationPayload) {
  const swapIndex = wallet.currentEon.transactions.findIndex(
    transaction => transaction.id === swapFinalization.id,
  )

  if (swapIndex !== -1) {
    const walletId: WalletId = {
      address: wallet.address,
      token: wallet.token,
      trailIdentifier: wallet.trailIdentifier,
    }
    const { recipientFinalizationActiveState } = swapFinalization
    wallet.currentEon.transactions[swapIndex] = {
      ...wallet.currentEon.transactions[swapIndex],
      recipientFinalizationActiveState: transformActiveStateFromServer(
        walletId,
        wallet.currentEon.eon,
        recipientFinalizationActiveState,
      ),
    }
  }
}

function syncSwapFreeze(wallet: Wallet, swapFreeze: SwapFreezePayload) {
  const swapIndex = wallet.currentEon.transactions.findIndex(
    transaction => transaction.id === swapFreeze.id,
  )

  if (swapIndex !== -1) {
    const { matchedAmounts } = swapFreeze
    wallet.currentEon.transactions[swapIndex] = {
      ...wallet.currentEon.transactions[swapIndex],
      matchedAmounts: {
        in: new BigNumber(matchedAmounts.matchedIn),
        out: new BigNumber(matchedAmounts.matchedOut),
      },
      cancelled: true,
    }
  }
}
