// These are the validators of data, that comes from server
// Done as part of e2e tests to not bloat release bundle with @hapi/joi dependency
// Ideally there should be TS types of server data and they should be source of truth
// for both these validations and server data parsers at `/services/operator/parsers`,
// but currently it's not easy to do due to joi's type definitions limitations
import Joi from '@hapi/joi'

import { PayloadValidators } from '../../src/services/operator/validators'

// TODO: Remove this file, add validations json file to operator with all schemas.
const mockValidators: PayloadValidators = {
  isValidating: true,
  validateDeposit: data => Joi.assert(data, depositSchema),
  validateSLA: data => Joi.assert(data, slaSchema),
  validateSLAInfo: data => Joi.assert(data, slaInfoSchema),
  validateTokensList: data => Joi.assert(data, tokensListSchema),
  validateTransaction: data => Joi.assert(data, transactionSchema),
  validateWalletRegistration: data => Joi.assert(data, walletRegistrationSchema),
  validateWalletState: data => Joi.assert(data, walletStateSchema),
  validateSwapCancellation: data => Joi.assert(data, swapCancellationSchema),
  validateSwapFinalization: data => Joi.assert(data, swapFinalizationSchema),
  validateSwapFreeze: data => Joi.assert(data, swapFreezeSchema),
  validateOrderBook: data => Joi.assert(data, orderBookSchema),
}

jest.mock('../../src/services/operator/validators', () => ({
  payloadValidators: mockValidators,
}))

// Payload schemas
const slaSchema = Joi.object({
  transfer_id: Joi.number(),
  expiry: Joi.number(),
})

const slaInfoSchema = Joi.object({
  token: Joi.string(),
  cost: Joi.number().unsafe(),
  recipient: Joi.string(),
  limit: Joi.number(),
})

const walletRegistrationSchema = Joi.object({
  eon_number: Joi.number(),
  authorization: Joi.string(),
  operator_authorization: Joi.string().allow(null),
  trail_identifier: Joi.number(),
})

const walletIdSchema = Joi.object({
  address: Joi.string(),
  token: Joi.string(),
  trail_identifier: Joi.number(),
})

const activeStateSchema = Joi.object({
  wallet_signature: Joi.string(),
  operator_signature: Joi.string().allow(null),
  updated_spendings: Joi.string(),
  updated_gains: Joi.string(),
  tx_set_hash: Joi.string(),
  tx_set_proof: Joi.array().items(Joi.string()),
  tx_set_index: Joi.number(),
})

const merkleProofSchema = Joi.object({
  eon_number: Joi.number(),
  left: Joi.string(),
  right: Joi.string(),
  allotment_chain: Joi.array().items(Joi.string()),
  membership_chain: Joi.array().items(Joi.string()),
  values: Joi.array().items(Joi.string()),
  trail: Joi.number(),
  active_state_checksum: Joi.string(),
  active_state: activeStateSchema.allow(null),
  passive_checksum: Joi.string(),
  passive_amount: Joi.string(),
  passive_marker: Joi.string(),
})

const deliveryProofSchema = Joi.object({
  merkle_proof: merkleProofSchema,
  transfer_membership_chain: Joi.array().items(Joi.string()),
  transfer_membership_values: Joi.array()
    .items(Joi.string())
    .allow(null),
  transfer_membership_trail: Joi.number(),
})

const matchedAmountsScheme = Joi.object({
  matched_in: Joi.string(),
  matched_out: Joi.string(),
})

const transactionSchema = Joi.object({
  id: Joi.number(),
  tx_id: Joi.string(),
  amount: Joi.string(),
  amount_swapped: Joi.string().allow(null),
  wallet: walletIdSchema,
  recipient: walletIdSchema,
  nonce: Joi.string(),
  passive: Joi.boolean(),
  position: Joi.string().allow(null),
  sender_active_state: activeStateSchema,
  recipient_active_state: activeStateSchema.allow(null),
  recipient_fulfillment_active_state: activeStateSchema.allow(null),
  recipient_finalization_active_state: activeStateSchema.allow(null),
  sender_cancellation_active_state: activeStateSchema.allow(null),
  sender_finalization_active_state: activeStateSchema.allow(null),
  recipient_cancellation_active_state: activeStateSchema.allow(null),
  swap_freezing_signature: Joi.string().allow(null),
  sender_starting_balance: Joi.string().allow(null),
  recipient_starting_balance: Joi.string().allow(null),
  delivery_proof: deliveryProofSchema.allow(null),
  eon_number: Joi.number(),
  processed: Joi.boolean(),
  complete: Joi.boolean(),
  voided: Joi.boolean(),
  cancelled: Joi.boolean(),
  appended: Joi.boolean(),
  matched_amounts: matchedAmountsScheme.allow(null),
  time: Joi.number(),
  swap: Joi.boolean(),
  sell_order: Joi.boolean(),
})

const tokensListSchema = Joi.array().items(
  Joi.object({
    address: Joi.string(),
    name: Joi.string(),
    short_name: Joi.string(),
  }),
)

const depositSchema = Joi.object({
  txid: Joi.string(),
  block: Joi.number(),
  eon_number: Joi.number(),
  amount: Joi.string(),
  time: Joi.number(),
})

const withdrawalRequestSchema = depositSchema.append({
  // @ts-ignore
  slashed: Joi.boolean(),
})

const withdrawalSchema = depositSchema.append({
  // @ts-ignore
  request: withdrawalRequestSchema,
})

const walletStateSchema = Joi.object({
  registration: walletRegistrationSchema,
  merkle_proof: merkleProofSchema.allow(null),
  transactions: Joi.array().items(transactionSchema),
  deposits: Joi.array().items(depositSchema),
  withdrawal_requests: Joi.array().items(withdrawalRequestSchema),
  withdrawals: Joi.array().items(withdrawalSchema),
})

const swapFreezeSchema = Joi.object({
  id: Joi.number(),
  tx_id: Joi.string(),
  matched_amounts: matchedAmountsScheme,
})

const swapFinalizationSchema = Joi.object({
  id: Joi.number(),
  tx_id: Joi.string(),
  recipient_finalization_active_state: activeStateSchema,
})

const swapCancellationSchema = Joi.object({
  id: Joi.number(),
  tx_id: Joi.string(),
  sender_cancellation_active_state: activeStateSchema,
  recipient_cancellation_active_state: activeStateSchema,
})

const orderSchema = Joi.object({
  amount: Joi.string(),
  amount_swapped: Joi.string(),
  remaining_in: Joi.string(),
  remaining_out: Joi.string(),
})

const orderBookSchema = Joi.object({
  sell_orders: Joi.array().items(orderSchema),
  buy_orders: Joi.array().items(orderSchema),
})
