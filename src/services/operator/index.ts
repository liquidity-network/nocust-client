import { request } from './request'
import { TokenInfo } from '../../nocust/getSupportedTokens'
import { SLAInfo } from '../../nocust/getSLAInfo'
import { store } from '../../store'
import {
  parseSLAInfo, parseTokenInfo, parseTransaction, parseRegistration, parseWalletState,
  parseOperatorStatus,
  parseToSConfig,
  parseSwapFreeze,
  parseSwapCancellation,
  parseSwapFinalization,
  parseOrderBook,
} from './parsers' // prettier-ignore
import {
  OperatorStatusPayload, RegistrationPayload, WalletStatePayload, TransactionPayload,
  SLAStatusPayload,
  ToSConfigPayload,
  SwapFreezePayload,
  SwapCancellationPayload,
  SwapFinalizationPayload,
  OrderBookPayload,
} from './payloads' // prettier-ignore
import { remove0x } from '../../helpers/utils'
import { NCError, NCErrorCode, NCServerErrorCode } from '../../helpers/errors'
import { Signature, signatureToRSV } from '../../wallet/signature'
import { BalanceMarker } from '../../wallet/balanceMarker'
import { Wallet } from '../../wallet'
import { payloadValidators } from './validators'
import BigNumber from 'bignumber.js'

export const operator = {
  getSLAInfo,
  getSLAStatus,
  getStatus,
  getTokensList,
  getTransfer,
  getTransfers,
  fetchWalletState,
  getWalletRegistration,
  registerWallet,
  sendTransfer,
  postSLA,
  getToSDigests,
  postToSSignature,
  registerBulkWallets,
  sendSwapOrder,
  sendSwapFreezing,
  sendSwapCancellation,
  sendSwapFinalization,
  getOrderbook,
}

async function getStatus(): Promise<OperatorStatusPayload> {
  try {
    const data = await request('audit', 'get')
    return parseOperatorStatus(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getSLAInfo(): Promise<SLAInfo> {
  try {
    if (store.slaInfo) return store.slaInfo

    const data = await request('sla', 'get')

    if (payloadValidators.isValidating) payloadValidators.validateSLAInfo(data)

    store.slaInfo = parseSLAInfo(data)
    return store.slaInfo
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getTokensList(): Promise<TokenInfo[]> {
  try {
    const data = await request('audit/tokens/', 'get')

    if (payloadValidators.isValidating) payloadValidators.validateTokensList(data)

    return parseTokenInfo(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

type FetchWalletStateConfig = { address: string; token: string; eon: number }
async function fetchWalletState(config: FetchWalletStateConfig): Promise<WalletStatePayload> {
  try {
    const { token, address, eon } = config
    const data = await request('audit/' + eon + '/' + token + '/' + address + '/', 'get')

    if (payloadValidators.isValidating) payloadValidators.validateWalletState(data)

    return parseWalletState(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getWalletRegistration(address: string, token: string): Promise<RegistrationPayload> {
  try {
    const data = await request('audit/' + token + '/' + address + '/whois', 'get')

    if (payloadValidators.isValidating) payloadValidators.validateWalletRegistration(data)

    return parseRegistration(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getTransfer(id: number): Promise<TransactionPayload> {
  try {
    const data = await request('audit/transactions/' + id, 'get')

    if (payloadValidators.isValidating) payloadValidators.validateTransaction(data)

    return parseTransaction(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

export type TransactionsParams = {
  offset?: number
  limit?: number
  txId?: string
  eon?: number
  nonce?: number
  search?: string
  passive?: boolean
  complete?: boolean
  swap?: boolean
  cancelled?: boolean
  voided?: boolean
  ordering?: string
}
async function getTransfers(params: TransactionsParams): Promise<TransactionPayload[]> {
  try {
    const paramsTransformed = { ...params, tx_id: params.txId, eon_number: params.eon }
    const data = await request('audit/transactions', 'get', undefined, paramsTransformed)
    return data.results.map((t: any) => parseTransaction(t))
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getSLAStatus(address: string): Promise<number> {
  try {
    const data: SLAStatusPayload = await request('sla/' + address, 'get')

    if (payloadValidators.isValidating) payloadValidators.validateSLA(data)

    return data.expiry
  } catch (e) {
    return Promise.reject(e)
  }
}

function registerWallet(wallet: Wallet, authSignature: Signature, tosSignature: Signature) {
  try {
    return request('admission/', 'post', {
      authorization: { value: signatureToRSV(authSignature) },
      address: remove0x(wallet.address),
      token: remove0x(wallet.token),
      tos_signature: { value: signatureToRSV(tosSignature) },
    })
  } catch (e) {
    if (e.message === NCServerErrorCode.NON_UNIQUE) {
      return Promise.reject(new NCError(NCErrorCode.WALLET_ALREADY_REGISTERED, undefined, e))
    } else return Promise.reject(e)
  }
}

export type RegisterationConfig = {
  wallet: Wallet
  authSignature: Signature
  tosSignature: Signature
}
function registerBulkWallets(walletsConfig: RegisterationConfig[]) {
  try {
    return request('admission/bulk/', 'post', {
      admissions: walletsConfig.map(config => ({
        authorization: { value: signatureToRSV(config.authSignature) },
        address: remove0x(config.wallet.address),
        token: remove0x(config.wallet.token),
        tos_signature: { value: signatureToRSV(config.tosSignature) },
      })),
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

type SendTransferConfig = {
  activeStateSignature: Signature
  balanceMarkerSignature: Signature
  nonce: BigNumber
  senderAddress: string
  recipientAddress: string
  tokenAddress: string
  eon: number
  amount: BigNumber
  balanceMarker: BalanceMarker
}
async function sendTransfer(config: SendTransferConfig) {
  try {
    const data = await request('transfer/', 'post', {
      wallet: {
        address: remove0x(config.senderAddress),
        token: remove0x(config.tokenAddress),
      },
      amount: config.amount,
      nonce: config.nonce,
      eon_number: config.eon,
      recipient: {
        address: remove0x(config.recipientAddress),
        token: remove0x(config.tokenAddress),
      },
      debit_balance: config.balanceMarker.balance,
      debit_signature: { value: signatureToRSV(config.activeStateSignature) },
      debit_balance_signature: { value: signatureToRSV(config.balanceMarkerSignature) },
    })

    // TODO Uncomment when this will be fixed - https://github.com/liquidity-network/nocust-server/issues/334
    if (payloadValidators.isValidating) payloadValidators.validateTransaction(data)

    return parseTransaction(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function postSLA(address: string, transferId: number) {
  try {
    await request('sla/' + address, 'post', { transfer_id: transferId })
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getToSDigests(): Promise<ToSConfigPayload> {
  try {
    const data = await request('tos/latest', 'get')
    return parseToSConfig(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function postToSSignature(address: string, tosSignature: Signature) {
  try {
    await request('tos/', 'post', {
      address,
      tos_signature: signatureToRSV(tosSignature),
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

type SendSwapOrderConfig = {
  creditWallet: Wallet
  debitWallet: Wallet
  creditActiveStateSignatures: Array<Signature>
  debitActiveStateSignatures: Array<Signature>
  fulfillmentActiveStateSignatures: Array<Signature>
  creditBalanceSignatures: Array<Signature>
  debitBalanceSignatures: Array<Signature>
  eon: number
  amount: BigNumber
  amountSwapped: BigNumber
  nonce: BigNumber
}

async function sendSwapOrder(config: SendSwapOrderConfig) {
  try {
    const data = await request('swap/', 'post', {
      debit_signature: config.debitActiveStateSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
      credit_signature: config.creditActiveStateSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
      credit_balance_signature: config.creditBalanceSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
      debit_balance_signature: config.debitBalanceSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
      credit_fulfillment_signature: config.fulfillmentActiveStateSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
      eon_number: config.eon,
      amount: config.amount,
      amount_swapped: config.amountSwapped,
      nonce: config.nonce,
      wallet: {
        address: remove0x(config.debitWallet.address),
        token: remove0x(config.debitWallet.token),
      },
      recipient: {
        address: remove0x(config.creditWallet.address),
        token: remove0x(config.creditWallet.token),
      },
    })

    if (payloadValidators.isValidating) payloadValidators.validateTransaction(data)

    return parseTransaction(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function sendSwapFreezing(
  swapId: number,
  freezingSignature: Signature,
): Promise<SwapFreezePayload> {
  try {
    const data = await request(`swap/${swapId}/freeze`, 'put', {
      freezing_signature: {
        value: signatureToRSV(freezingSignature),
      },
    })
    if (payloadValidators.isValidating) payloadValidators.validateSwapFreeze(data)
    return parseSwapFreeze(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function sendSwapCancellation(
  swapId: number,
  creditCancellationSignatures: Array<Signature>,
  debitCancellationSignatures: Array<Signature>,
): Promise<SwapCancellationPayload> {
  try {
    const data = await request(`swap/${swapId}/cancel`, 'put', {
      sender_cancellation_signature: debitCancellationSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
      recipient_cancellation_signature: creditCancellationSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
    })
    if (payloadValidators.isValidating) payloadValidators.validateSwapCancellation(data)
    return parseSwapCancellation(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function sendSwapFinalization(
  swapId: number,
  finalizationSignatures: Array<Signature>,
): Promise<SwapFinalizationPayload> {
  try {
    const data = await request(`swap/${swapId}/finalize`, 'put', {
      finalization_signature: finalizationSignatures.map(signature => ({
        value: signatureToRSV(signature),
      })),
    })
    if (payloadValidators.isValidating) payloadValidators.validateSwapFinalization(data)
    return parseSwapFinalization(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getOrderbook(
  baseTokenAddress: string,
  quoteTokenAddress: string,
): Promise<OrderBookPayload> {
  try {
    const data = await request(`audit/${baseTokenAddress}/${quoteTokenAddress}/orderbook`, 'get')
    if (payloadValidators.isValidating) payloadValidators.validateOrderBook(data)
    return parseOrderBook(data)
  } catch (e) {
    return Promise.reject(e)
  }
}
