import BigNumber from 'bignumber.js'

import { SLAInfo } from '../../nocust/getSLAInfo'
import { TokenInfo } from '../../nocust/getSupportedTokens'
import {
  ActiveStatePayload,
  BlockEonPayload,
  DeliveryProofPayload,
  MatchedAmountsPayload,
  EonDataPayload,
  OperatorStatusPayload,
  RegistrationPayload,
  WalletStatePayload,
  TransactionPayload,
  DepositPayload,
  ToSConfigPayload,
  SwapFreezePayload,
  SwapCancellationPayload,
  SwapFinalizationPayload,
  OrderBookPayload,
  OrderPayload
} from './payloads' // prettier-ignore

export const parseSLAInfo = (data: any): SLAInfo => ({
  token: data.token,
  price: new BigNumber(data.cost),
  recipient: data.recipient,
  monthlyLimit: data.limit,
})

export const parseTokenInfo = (data: any): TokenInfo[] =>
  data.map((t: any) => ({
    address: t.address,
    name: t.name,
    shortName: t.short_name,
  }))

export const parseRegistration = (data: any): RegistrationPayload => ({
  eon: data.eon_number,
  walletSignature: data.authorization,
  operatorSignature: data.operator_authorization,
  trailIdentifier: data.trail_identifier,
})

export const parseActiveState = (data: any): ActiveStatePayload => ({
  walletSignature: data.wallet_signature,
  operatorSignature: data.operator_signature,
  updatedSpendings: data.updated_spendings,
  updatedGains: data.updated_gains,
  txSetHash: data.tx_set_hash,
})

export const parseMerkleProof = (data: any): EonDataPayload => ({
  eon: data.eon_number,
  left: data.left,
  right: data.right,
  allotmentChain: data.allotment_chain,
  membershipChain: data.membership_chain,
  values: data.values,
  trail: data.trail,
  activeStateHash: data.active_state_checksum,
  activeState: data.active_state ? parseActiveState(data.active_state) : data.active_state,
  passiveHash: data.passive_checksum,
  passiveAmount: data.passive_amount,
  passiveMarker: data.passive_marker,
})

export const parseDeliveryProof = (data: any): DeliveryProofPayload => ({
  merkleProof: data.merkle_proof ? parseMerkleProof(data.merkle_proof) : data.merkle_proof,
  transferMembershipChain: data.transfer_membership_chain,
  transferMembershipTrail: data.transfer_membership_trail,
  transferMembershipValues: data.transfer_membership_values,
})

export const parseMatchedAmounts = (data: any): MatchedAmountsPayload => ({
  matchedIn: data.matched_in,
  matchedOut: data.matched_out,
})

export const parseTransaction = (data: any): TransactionPayload => ({
  id: data.id,
  txId: data.tx_id,
  amount: new BigNumber(data.amount),
  amountSwapped: data.amount_swapped ? new BigNumber(data.amount_swapped) : data.amount_swapped,
  wallet: {
    address: data.wallet.address,
    token: data.wallet.token,
    trailIdentifier: data.wallet.trail_identifier,
  },
  recipient: {
    address: data.recipient.address,
    token: data.recipient.token,
    trailIdentifier: data.recipient.trail_identifier,
  },
  nonce: data.nonce,
  passiveMarker: data.position,
  senderActiveState: data.sender_active_state
    ? parseActiveState(data.sender_active_state)
    : data.sender_active_state,
  recipientActiveState: data.recipient_active_state
    ? parseActiveState(data.recipient_active_state)
    : data.recipient_active_state,
  recipientFulfillmentActiveState: data.recipient_fulfillment_active_state
    ? parseActiveState(data.recipient_fulfillment_active_state)
    : data.recipient_fulfillment_active_state,
  recipientFinalizationActiveState: data.recipient_finalization_active_state
    ? parseActiveState(data.recipient_finalization_active_state)
    : data.recipient_finalization_active_state,
  swapFreezingSignature: data.swap_freezing_signature,
  senderCancellationActiveState: data.sender_cancellation_active_state
    ? parseActiveState(data.sender_cancellation_active_state)
    : data.sender_cancellation_active_state,
  senderFinalizationActiveState: data.sender_finalization_active_state
    ? parseActiveState(data.sender_finalization_active_state)
    : data.sender_finalization_active_state,
  recipientCancellationActiveState: data.recipient_cancellation_active_state
    ? parseActiveState(data.recipient_cancellation_active_state)
    : data.recipient_cancellation_active_state,
  senderStartingBalance: data.sender_starting_balance,
  recipientStartingBalance: data.recipient_starting_balance,
  deliveryProof: data.delivery_proof
    ? parseDeliveryProof(data.delivery_proof)
    : data.delivery_proof,
  eon: data.eon_number,
  processed: data.processed,
  complete: data.complete,
  voided: data.voided,
  cancelled: data.cancelled,
  appended: data.appended,
  matchedAmounts: data.matched_amounts
    ? parseMatchedAmounts(data.matched_amounts)
    : data.matched_amounts,
  time: data.time,
  swap: data.swap,
})

export const parseWalletState = (data: any): WalletStatePayload => ({
  registration: parseRegistration(data.registration),
  merkleProof: data.merkle_proof ? parseMerkleProof(data.merkle_proof) : data.merkle_proof,
  transactions: data.transactions.map(parseTransaction),
  deposits: data.deposits.map(parseDeposit),
  withdrawalRequests: data.withdrawal_requests,
  withdrawals: data.withdrawals,
})

export const parseBlockEon = (data: any): BlockEonPayload => ({
  block: data.block,
  eon: data.eon_number,
})

export const parseOperatorStatus = (data: any): OperatorStatusPayload => ({
  latest: parseBlockEon(data.latest),
  confirmed: parseBlockEon(data.confirmed),
})

export const parseDeposit = (data: any): DepositPayload => ({
  txId: data.txid,
  block: data.block,
  eon: data.eon_number,
  amount: data.amount,
  time: data.time,
})

export const parseToSConfig = (data: any): ToSConfigPayload => ({
  privacyPolicyDigest: data.privacy_policy_digest,
  termsOfServiceDigest: data.terms_of_service_digest,
  time: data.time,
})

export const parseSwapFreeze = (data: any): SwapFreezePayload => ({
  id: data.id,
  txId: data.tx_id,
  matchedAmounts: parseMatchedAmounts(data.matched_amounts),
})

export const parseSwapCancellation = (data: any): SwapCancellationPayload => ({
  id: data.id,
  txId: data.tx_id,
  senderCancellationActiveState: parseActiveState(data.sender_cancellation_active_state),
  recipientCancellationActiveState: parseActiveState(data.recipient_cancellation_active_state),
})

export const parseSwapFinalization = (data: any): SwapFinalizationPayload => ({
  id: data.id,
  txId: data.tx_id,
  recipientFinalizationActiveState: parseActiveState(data.recipient_finalization_active_state),
})

export const parseOrder = (data: any): OrderPayload => ({
  amount: new BigNumber(data.amount),
  amountSwapped: new BigNumber(data.amount_swapped),
  remainingIn: new BigNumber(data.remaining_in),
  remainingOut: new BigNumber(data.remaining_out),
})

export const parseOrderBook = (data: any): OrderBookPayload => ({
  buyOrders: data.buy_orders.map(parseOrder),
  sellOrders: data.sell_orders.map(parseOrder),
})
