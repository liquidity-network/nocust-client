import BigNumber from 'bignumber.js'
import { computed, observable, reaction } from 'mobx'

import {
  Transaction,
  MatchedAmounts,
  getTransactionActiveState,
  transactionToMerkleTree,
} from './transaction'
import { constructMerkleTree, MerkleTree } from './merkleTree'
import { ActiveState, hashActiveState } from './activeState'
import { Deposit, Withdrawal, WithdrawalRequest } from './parentChainTxs'
import { IntervalProof } from './intervalTree'
import { Wallet } from './index'
import { BN_ZERO } from '../constants'
import { nocust } from '../nocust'
import { createFinalizationSignatures } from '../services/swaps'
import { operator } from '../services/operator'
import { syncWallet, SyncWalletEvent } from './syncWallet'
import { Mutex } from 'async-mutex'

export class Eon {
  wallet: Wallet

  eon: number

  // This lock ensures that the finalizeAndHarvest() reaction is only called once at a time
  reactionLock: Mutex = new Mutex()

  membershipProofPath: string[]

  accountProof: IntervalProof

  @observable deposits: Deposit[]

  @observable transactions: Transaction[]

  @observable withdrawalRequest: WithdrawalRequest[]

  @observable withdrawal: Withdrawal

  @computed get activeTransactions(): Transaction[] {
    return this.transactions.filter(
      t => !t.voided && !(!t.swap && t.recipient.address === this.wallet.address),
    )
  }

  // Returns the latest transaction which is not voided or passively received
  @computed get lastTransaction(): Transaction {
    return [...this.activeTransactions].pop()
  }

  @computed get outgoingTransactions(): Transaction[] {
    return this.transactions.filter(
      t => t.sender.address === this.wallet.address && t.sender.token === this.wallet.token,
    )
  }

  @computed get incomingTransactions(): Transaction[] {
    return this.transactions.filter(
      t => t.recipient.address === this.wallet.address && t.recipient.token === this.wallet.token,
    )
  }

  @computed get passiveAmountReceived(): BigNumber {
    return this.incomingTransactions
      .filter(t => !t.swap)
      .reduce((sum, t) => sum.plus(t.amount), BN_ZERO)
  }

  @computed get spentAndGained(): SpentAndGained {
    if (!this.lastTransaction) {
      return { spent: BN_ZERO, gained: BN_ZERO }
    }
    const isOutgoing =
      this.wallet.address === this.lastTransaction.sender.address &&
      this.wallet.token === this.lastTransaction.sender.token

    if (
      this.lastTransaction.swap &&
      !this.lastTransaction.recipientFinalizationActiveState &&
      !this.lastTransaction.cancelled &&
      !this.lastTransaction.voided
    ) {
      const currentMatchedAmounts = this.eonMatchedAmounts(this.lastTransaction)
      if (isOutgoing) {
        const spent = this.lastTransaction.senderActiveState.spent
        const gained = this.lastTransaction.senderActiveState.gained
          .plus(this.lastTransaction.amount)
          .minus(currentMatchedAmounts.out)
        return { spent, gained }
      } else {
        const spent = this.lastTransaction.recipientActiveState.spent
        const gained = this.lastTransaction.recipientActiveState.gained.plus(
          currentMatchedAmounts.in,
        )
        return { spent, gained }
      }
    } else {
      const lastTransactionState = getTransactionActiveState(this.lastTransaction, isOutgoing)
      const spent = lastTransactionState.spent
      let gained = lastTransactionState.gained

      if (this.lastTransaction.swap) {
        const currentMatchedAmounts = this.eonMatchedAmounts(this.lastTransaction)
        if (this.lastTransaction.complete && isOutgoing) {
          const totalMatchedOut = this.lastTransaction.matchedAmounts.out
          gained = gained.plus(totalMatchedOut.minus(currentMatchedAmounts.out))
        }
        if (
          this.lastTransaction.cancelled &&
          !this.lastTransaction.recipientCancellationActiveState &&
          !isOutgoing
        ) {
          gained = gained.plus(currentMatchedAmounts.in)
        }
      }
      return { spent, gained }
    }
  }

  // Sum of all deposits of current eon
  @computed get deposited(): BigNumber {
    return this.deposits.reduce((sum, deposit) => sum.plus(deposit.amount), BN_ZERO)
  }

  @computed get initialBalanceAllotment(): BigNumber {
    return this.accountProof.right.minus(this.accountProof.left)
  }

  @computed get balance(): BigNumber {
    return this.initialBalanceAllotment
      .plus(this.deposited)
      .plus(this.passiveAmountReceived)
      .plus(this.spentAndGained.gained)
      .minus(this.spentAndGained.spent)
  }

  @computed get activeTree(): MerkleTree {
    return constructMerkleTree(
      this.activeTransactions.map(t =>
        transactionToMerkleTree(t, this.wallet, this.lastTransaction),
      ),
    )
  }

  @computed get passiveTree(): MerkleTree {
    return constructMerkleTree(
      this.incomingTransactions.map(t =>
        transactionToMerkleTree(t, this.wallet, this.lastTransaction),
      ),
    )
  }

  @computed get activeState(): ActiveState {
    return {
      address: this.wallet.address,
      token: this.wallet.token,
      eon: this.eon,
      trailIdentifier: this.accountProof.trailIdentifier,
      transactionSetHash: this.activeTree.hash,
      spent: this.spentAndGained.spent,
      gained: this.spentAndGained.gained,
    }
  }

  @computed get passiveAggregate(): PassiveAggregate {
    return {
      passiveTreeRoot: this.passiveTree.hash,
      passiveAmountReceived: this.passiveAmountReceived,
      lastOutgoingTransferPassiveMarker:
        // TODO If no outgoing transfers done, we need to fetch this data from API(?)
        this.outgoingTransactions.length > 0
          ? this.outgoingTransactions[this.outgoingTransactions.length - 1].passiveMarker
          : BN_ZERO,
    }
  }

  @computed get isAvailableForSwaps(): boolean {
    const isAvailable = true
    if (this.lastTransaction && this.lastTransaction.swap) {
      const swap = this.lastTransaction
      const isPending = !swap.complete && !swap.senderCancellationActiveState && !swap.voided
      if (isPending) {
        return false
      }
    }
    return isAvailable
  }

  eonMatchedAmounts(swap: Transaction): MatchedAmounts {
    const { in: totalIn, out: totalOut } = swap.matchedAmounts
    if (!this.wallet.previousEon) {
      return { in: totalIn, out: totalOut }
    }
    const prevEonSwap = this.wallet.previousEon.transactions.find(t => t.txId === swap.txId)
    // Swap is in it's first eon
    if (!prevEonSwap) {
      return { in: totalIn, out: totalOut }
    }
    const { in: prevIn, out: prevOut } = prevEonSwap.matchedAmounts
    return { in: totalIn.minus(prevIn), out: totalOut.minus(prevOut) }
  }

  constructor(wallet: Wallet, number: number) {
    this.wallet = wallet
    this.eon = number
    this.membershipProofPath = []
    this.accountProof = {
      root: null,
      path: [],
      pathValues: [],
      left: BN_ZERO,
      right: BN_ZERO,
      trailIdentifier: this.wallet.trailIdentifier,
      leafChecksum: null,
      totalAllotment: null,
    }
    this.deposits = []
    this.transactions = []

    reaction(() => this.lastTransaction, this.finalizeAndHarvestLocked.bind(this))
  }

  finalizeAndHarvestLocked() {
    return this.reactionLock.runExclusive(async () => this.finalizeAndHarvest.bind(this)())
  }

  async finalizeAndHarvest() {
    try {
      if (this.isAvailableForSwaps) {
        const txLength = this.transactions.length
        // Make sure latest appended transaction is a swap
        if (txLength > 0 && this.transactions[txLength - 1].swap) {
          const swap = this.transactions[txLength - 1]
          const isIncoming = this.wallet.token === swap.recipient.token
          if (isIncoming && swap.complete && !swap.recipientFinalizationActiveState) {
            console.log('Finalizing >>>>>>>', this.wallet.address, this.wallet.token)
            const wallet = await nocust.getWallet(this.wallet.address, this.wallet.token)
            const { finalizationSignatures } = await createFinalizationSignatures(wallet, swap)
            const swapFinalization = await operator.sendSwapFinalization(
              swap.id,
              finalizationSignatures,
            )
            await syncWallet(wallet, SyncWalletEvent.SYNC_SWAP_FINALIZATION, swapFinalization)
            console.log('Successfully Finalized >>>>>>>', this.wallet.address, this.wallet.token)
          }
          if (
            this.balance.gt(0) &&
            (swap.recipientFinalizationActiveState || swap.recipientCancellationActiveState)
          ) {
            console.log('Harvesting >>>>>>>', this.wallet.address, this.wallet.token)
            await nocust.transfer({
              amount: this.balance,
              from: this.wallet.address,
              to: this.wallet.parentAddress,
              token: this.wallet.token,
            })
            console.log('Successfully Harvested >>>>>>>', this.wallet.address, this.wallet.token)
          }
        }
      }
    } catch (e) {
      console.log(
        `Error occurred while trying to finalize/harvest ${this.wallet.token}/${this.wallet.address}`,
        e,
      )
    }
  }

  clone(): Eon {
    const eon = new Eon(this.wallet, this.eon)
    eon.accountProof = { ...this.accountProof }
    eon.membershipProofPath = this.membershipProofPath
    eon.deposits = [...this.deposits]
    eon.transactions = [...this.transactions]
    return eon
  }

  toJSON(): Omit<
    Eon,
    | 'wallet'
    | 'passiveAggregate'
    | 'activeState'
    | 'passiveTree'
    | 'outgoingTransactions'
    | 'incomingTransactions'
    | 'spent'
    | 'gained'
    | 'deposited'
    | 'balance'
    | 'activeTree'
    | 'clone'
    | 'toJSON'
    | 'proofOfExclusiveBalanceAllotment'
    | 'passiveAmountReceived'
    | 'initialBalanceAllotment'
    | 'spentAndGained'
    | 'lastTransaction'
    | 'eonMatchedAmounts'
    | 'activeTransactions'
    | 'isAvailableForSwaps'
    | 'finalizeAndHarvest'
    | 'reactionLock'
    | 'finalizeAndHarvestLocked'
  > {
    return {
      eon: this.eon,
      membershipProofPath: this.membershipProofPath,
      accountProof: this.accountProof,
      deposits: this.deposits,
      transactions: this.transactions,
      withdrawalRequest: this.withdrawalRequest,
      withdrawal: this.withdrawal,
    }
  }

  // For checkpoint verification and to withdraw
  @computed get proofOfExclusiveBalanceAllotment(): ProofOfExclusiveBalanceAllotment {
    return {
      token: this.wallet.token,
      activeStateHash: hashActiveState(this.activeState, true),
      accountProof: this.accountProof,
      membershipProofPath: this.membershipProofPath,
      passiveAggregate: this.passiveAggregate,
    }
  }
}

export interface ProofOfExclusiveBalanceAllotment {
  token: string
  activeStateHash: string

  membershipProofPath: string[]
  accountProof: IntervalProof
  passiveAggregate: PassiveAggregate
}

interface PassiveAggregate {
  passiveTreeRoot: string
  passiveAmountReceived: BigNumber
  lastOutgoingTransferPassiveMarker: BigNumber
}

export interface SpentAndGained {
  spent: BigNumber
  gained: BigNumber
}
