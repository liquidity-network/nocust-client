export enum NCErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // Initialization failed, probably error connecting blockchain, please retry
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',

  // Wallet not registered
  WALLET_UNREGISTERED = 'WALLET_UNREGISTERED',

  // Recipient should be registered to receive assets
  RECIPIENT_UNREGISTERED = 'RECIPIENT_UNREGISTERED',

  WALLET_ALREADY_REGISTERED = 'WALLET_ALREADY_REGISTERED',

  CAN_NOT_RECOVER_FUNDS = 'CAN_NOT_RECOVER_FUNDS',

  // Private key was not added, please do it via `nocust.addPrivateKey()`
  NO_PRIVATE_KEY = 'NO_PRIVATE_KEY',

  SLA_NOT_EXPIRED_YET = 'SLA_NOT_EXPIRED_YET',

  // Could not prepare transfer/swap hashes
  PREPARE_TRANSFER_FAILURE = 'PREPARE_TRANSFER_FAILURE',

  // Post request to operator server failed
  POST_FAILURE = 'POST_FAILURE',

  // DoS protection of the server, human verification required
  REGISTRATION_THROTTLING = 'REGISTRATION_THROTTLING',

  // Error when fetching data from the operator API
  FETCH_OPERATOR_DATA_ERROR = 'FETCH_OPERATOR_DATA_ERROR',

  // Error when fetching data from contract/blockchain
  FETCH_PARENT_CHAIN_DATA_ERROR = 'FETCH_PARENT_CHAIN_DATA_ERROR',

  // Confirmation timeout of WS message of transfer/registration/swap
  CONFIRMATION_TIMEOUT = 'CONFIRMATION_TIMEOUT',

  // Exact same transfer/swap/registration was already posted, adjust nonce
  NON_UNIQUE_TRANSFER = 'NON_UNIQUE_TRANSFER',

  TX_HASH_NOT_FOUND = 'TX_HASH_NOT_FOUND',

  // Could not execute a blockchain transaction
  PARENT_CHAIN_TRANSACTION_FAILURE = 'PARENT_CHAIN_TRANSACTION_FAILURE',

  // Withdrawal limit below what is requested
  INSUFFICIENT_WITHDRAWAL_LIMIT = 'INSUFFICIENT_WITHDRAWAL_LIMIT',

  // Some Ether are needed to pay for gas fees
  NO_ETHER_TO_PAY_FOR_GAS = 'NO_ETHER_TO_PAY_FOR_GAS',

  // Sub account index was not found in the cache, to address that, simply do not run the pre-register function.
  SUB_ACCOUNT_INDEX_NOT_FOUND = 'SUB_ACCOUNT_INDEX_NOT_FOUND',

  // Cannot create any more non-blocking swaps, since all sub accounts are blocked
  SWAP_LIMIT_REACHED_ERROR = 'SWAP_LIMIT_REACHED_ERROR',

  // Not enough fETH
  INSUFFICIENT_COMMIT_CHAIN_BALANCE = 'INSUFFICIENT_COMMIT_CHAIN_BALANCE',

  // Not enough ETH/ERC20 token
  INSUFFICIENT_PARENT_CHAIN_BALANCE = 'INSUFFICIENT_PARENT_CHAIN_BALANCE',

  // Throws if `deposit` was invoked without prior `approveDeposits` call for ERC20
  INSUFFICIENT_TRANSFER_ALLOWANCE = 'INSUFFICIENT_TRANSFER_ALLOWANCE',

  // A swap is pending so the account can't be use until the swap is finalized, canceled or the eons ends.
  SWAP_PENDING = 'SWAP_PENDING',

  // The requested transfer is not found
  TRANSFER_NOT_FOUND = 'TRANSFER_NOT_FOUND',

  // Attempting to make an off chain transfer to self.
  TRANSFER_TO_SELF = 'TRANSFER_TO_SELF',

  // Attempting to make a swap order before calling setupTrading for the token pair.
  NO_TRADING_SETUP = 'NO_TRADING_SETUP',

  CAN_NOT_CANCEL_SWAP = 'CAN_NOT_CANCEL_SWAP',

  CAN_NOT_ISSUE_STATE_UPDATE_CHALLENGE = 'CAN_NOT_ISSUE_STATE_UPDATE_CHALLENGE',

  CAN_NOT_ISSUE_DELIVERY_CHALLENGE = 'CAN_NOT_ISSUE_DELIVERY_CHALLENGE',
}

export enum NCServerErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // Client sent request with outdated eon number, need to reiterate
  EON_NUMBER_OUT_OF_SYNC = 'EON_NUMBER_OUT_OF_SYNC',

  // 404 error, item being requested is not found
  NOT_FOUND = 'NOT_FOUND',

  // Being thrown when server returns 5XX error
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  NON_UNIQUE = 'unique',
}

export class NCError extends Error {
  description?: string
  data?: Object

  constructor(code: NCErrorCode, description?: string, data?: Object) {
    super(code)

    this.description = description
    this.data = data
  }
}

export class NCServerError extends Error {
  description?: string
  data?: Object

  constructor(code: NCServerErrorCode, description?: string, data?: Object) {
    super(code)

    this.description = description
    this.data = data
  }
}
