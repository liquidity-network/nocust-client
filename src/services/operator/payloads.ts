// Server payload shapes
import BigNumber from 'bignumber.js'
import { WalletId } from '../../wallet'

export interface ActiveStatePayload {
  walletSignature: string
  operatorSignature: string
  updatedSpendings: string // Spent
  updatedGains: string // Gained
  txSetHash: string // Active tree root
}

export interface DeliveryProofPayload {
  merkleProof: EonDataPayload
  transferMembershipChain: string[]
  transferMembershipTrail: number
  transferMembershipValues: string[]
}

// Currently MerkleProof on server
export interface EonDataPayload {
  eon: number

  activeStateHash: string
  activeState: ActiveStatePayload

  membershipChain: string[] // path of membership tree

  // ProofOfExclusiveAllotment of account tree
  left: string
  right: string
  allotmentChain: string[] // path of account tree
  values: string[] // pathValues of account tree
  trail: number // leafIndex of account tree

  // Passive aggregate
  passiveHash: string // passive tree root
  passiveAmount: string // passive amount received
  passiveMarker: string // passive marker
}

export interface MatchedAmountsPayload {
  matchedIn: string
  matchedOut: string
}

export interface RegistrationPayload {
  eon: number
  walletSignature: string
  operatorSignature: string
  trailIdentifier: number
}

export interface WalletStatePayload {
  registration: RegistrationPayload
  merkleProof: EonDataPayload
  transactions: TransactionPayload[]
  deposits: DepositPayload[]
  withdrawalRequests: any[]
  withdrawals: any[]
}

export type BlockEonPayload = { block: number; eon: number }

export interface OperatorStatusPayload {
  latest: BlockEonPayload
  confirmed: BlockEonPayload
}

export interface TransactionPayload {
  id: number
  txId: string | null
  amount: BigNumber
  amountSwapped: BigNumber | null
  wallet: WalletId
  recipient: WalletId
  nonce: string
  passiveMarker: string | null
  senderActiveState: ActiveStatePayload | null
  recipientActiveState: ActiveStatePayload | null
  recipientFulfillmentActiveState: ActiveStatePayload | null
  recipientFinalizationActiveState: ActiveStatePayload | null
  swapFreezingSignature: string
  senderCancellationActiveState: ActiveStatePayload | null
  senderFinalizationActiveState: ActiveStatePayload | null
  recipientCancellationActiveState: ActiveStatePayload | null
  senderStartingBalance: string | null
  recipientStartingBalance: string | null
  deliveryProof: DeliveryProofPayload | null
  eon: number
  processed: boolean | null
  complete: boolean | null
  voided: boolean | null
  cancelled: boolean | null
  appended: boolean | null
  matchedAmounts: MatchedAmountsPayload | null
  time: number
  swap: boolean
}

export interface DepositPayload {
  txId: string
  block: number
  eon: number
  amount: string
  time: number
}

export type SLAStatusPayload = { expiry: number }

export interface ToSConfigPayload {
  privacyPolicyDigest: string
  termsOfServiceDigest: string
  time: number
}

export interface SwapFreezePayload {
  id: number
  txId: string
  matchedAmounts: MatchedAmountsPayload
}

export interface SwapCancellationPayload {
  id: number
  txId: string
  senderCancellationActiveState: ActiveStatePayload
  recipientCancellationActiveState: ActiveStatePayload
}

export interface SwapFinalizationPayload {
  id: number
  txId: string
  recipientFinalizationActiveState: ActiveStatePayload
}

export interface OrderPayload {
  amount: BigNumber
  amountSwapped: BigNumber
  remainingIn: BigNumber
  remainingOut: BigNumber
}

export interface OrderBookPayload {
  buyOrders: OrderPayload[]
  sellOrders: OrderPayload[]
}
