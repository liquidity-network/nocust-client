import BigNumber from 'bignumber.js'

export interface ParentChainTransaction {
  txId: string
  block: number
  eon: number
  amount: BigNumber
}

export type Deposit = ParentChainTransaction

export type WithdrawalRequest = ParentChainTransaction

export type Withdrawal = ParentChainTransaction
