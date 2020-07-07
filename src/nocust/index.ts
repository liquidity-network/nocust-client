import BigNumber from 'bignumber.js'

import init from './init'
import buySLA from './buySLA'
import deposit from './deposit'
import getBalance from './getBalance'
import getEon from './getEon'
import getEra from './getEra'
import getParentChainBalance from './getParentChainBalance'
import getOrderBook, { OrderBook } from './getOrderBook'
import approveDeposits from './approveDeposits'
import getSLAInfo, { SLAInfo } from './getSLAInfo'
import shutdown from './shutdown'
import getSLAStatus from './getSLAStatus'
import withdraw from './withdraw'
import registerWallet from './registerWallet'
import registerBulkWallets from './registerBulkWallets'
import transfer from './transfer'
import addOrder from './addOrder'
import cancelOrder from './cancelOrder'
import getSupportedTokens, { TokenInfo } from './getSupportedTokens'
import isWalletRegistered from './isWalletRegistered'
import confirmWithdrawal from './confirmWithdrawal'
import getTransfer from './getTransfer'
import getTransfers from './getTransfers'
import setupTrading from './setupTrading'
import getWithdrawalLimit from './getWithdrawalLimit'
import getWallet from './getWallet'
import getWithdrawalFee from './getWithdrawalFee'
import getLastSubmittedEon from './getLastSubmittedEon'
import isWalletRecovered from './isWalletRecovered'
import subscribe from './subscribe'
import issueDeliveryChallenge from './issueDeliveryChallenge'
import issueStateUpdateChallenge from './issueStateUpdateChallenge'
import recoverFunds from './recoverFunds'
import isRecoveryMode from './isRecoveryMode'
import hasOutstandingChallenges from './hasOutstandingChallenges'
import addPrivateKey from './addPrivateKey'
import getBlocksToWithdrawalConfirmation from './getBlocksToWithdrawalConfirmation'
import transferParentChain from './transferParentChain'
import { signToS } from './signToS'
import { Transaction } from '../wallet/transaction'
import { store } from '../store'
import { Wallet } from '../wallet'
import getMyOrders, { MyOrder } from './getMyOrders'

interface NOCUST {
  /**
   * Subscribes private key to all events for all available tokens
   */
  addPrivateKey(privateKey: string): Promise<string>
  /**
   * Prior check to send the deposit transaction it checks for token transfer allowance of the NOCUST smart contract. If the allowance is not sufficient it sends an ERC-20 `approve` transaction. Approving token transfers is a required operation by the ERC-20 standard. If the depositor does not have sufficient allowance the deposit will fail. Note that this function will make 2 on-chain transaction (contract calls) with the specified gas price and gas limit. Approvals are not required for Ether.
   */
  approveDeposits(config: {
    address: string
    token: string
    gasPrice: string | BigNumber
  }): Promise<string>
  /**
   * Buys a SLA. The address needs to have the token amount available as a nocust balance on the address as specified by the `getSLAInfo` function. This function will make a nocust transfer to pay for the SLA.

   */
  buySLA(address: string): Promise<Transaction>
  /**
   * Make an on-chain transaction to confirm a withdrawal previously initialized and effectively transfer the funds.
   */
  confirmWithdrawal(config: {
    address: string
    gasPrice: BigNumber | string
    token?: string
  }): Promise<string>
  /**
   * Make an on-chain transaction to deposit funds into the NOCUST commit-chain. This funds can be later used for making off-chain NOCUST transfers. The operator will credit the deposit after 20 blocks of confirmation.
   */
  deposit(config: {
    address: string
    amount: BigNumber
    gasPrice: string
    token?: string
    nonce?: number
  }): Promise<string>
  /** Fetch the current NOCUST balance. */
  getBalance(address: string, token?: string): Promise<BigNumber>
  /** Get the number of Eras (blocks) per Eon. */
  getBlocksPerEon(): number
  /** Get the number of blocks until it is possible to send the withdrawal confirmation on-chain transaction. It will return -1 if no withdrawals are pending or 0 if the withdrawal is ready to be confirmed. */
  getBlocksToWithdrawalConfirmation(txHash: string): Promise<number>
  /** Get the current Eon or round number. */
  getEon(): Promise<number>
  /** Get the current Era or sub-block number. The number of block since the current Eon started. */
  getEra(): Promise<number>
  /** Get current on-chain balance. */
  getParentChainBalance(address: string, token?: string): Promise<BigNumber>
  /** Fetches orderbook (buy|sell) orders */
  getOrderBook(baseTokenAddress: string, quoteTokenAddress: string): Promise<OrderBook>
  /**
   * Get informations about the SLA pricing model, Object with the token address with which to pay the SLA, the cost/amount of the SLA in this token, the recipient of the SLA payment, the transaction limit per month without SLA.
   */
  getSLAInfo(): Promise<SLAInfo>
  /** Returns 0 if not under SLA, expiry date unix timestamp in millisecond if currently enroll with a SLA. */
  getSLAStatus(address: string): Promise<number>
  /** Fetch the smart contract addresses of the supported token by the commit-chain. */
  getSupportedTokens(): Promise<TokenInfo[]>
  /** Fetch the transaction details given a transaction ID */
  getTransfer(id: number): Promise<Transaction>
  /** Get the list of transactions for a given address and token (Incoming and outgoing). */
  getTransfers(config: {
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
  }): Promise<Transaction[]>
  /** Get the `WalletState` object for lower level API use. */
  getWallet(address: string, token?: string): Promise<Wallet>
  /** Doing a withdrawal request involve a fee to the operator. This function gets the current fee. */
  getWithdrawalFee(gasPrice: BigNumber | string): BigNumber
  /** Withdrawals are limited to a certain amount (Because funds need to committed into a check point) and the limit increase over time. This method gets you the current available off-chain funds for withdrawal. */
  getWithdrawalLimit(address: string, token?: string): Promise<BigNumber>
  /** Get last submitted eon */
  getLastSubmittedEon(): Promise<number>
  /** Checks if wallet recovered its funds based on token */
  isWalletRecovered(config: { address: string; token?: string }): Promise<boolean>
  /** Checks if there is any pending challenges */
  hasOutstandingChallenges(): Promise<boolean>
  /** Initialize nocust with specified commit-chain that you want to connect to */
  init(config: {
    contractAddress: string
    rpcUrl: string
    operatorUrl: string
    storageEngine?: {
      get(key: string): Promise<string>
      set(key: string, value: string): Promise<boolean>
      delete(key: string): Promise<boolean>
      [T: string]: any
    }
    privateKey?: string
  }): Promise<void>
  /** Check if an address is registered with the nocust commit-chain. */
  isWalletRegistered(address: string, token?: string): Promise<boolean>
  /** Check whether the commit-chain is in recovery mode. If it is the case, the commit-chain can't be used anymore and funds need to be recovered.  */
  isRecoveryMode(): Promise<boolean>
  /** Make an on-chain transaction to initiate a delivery challenge. */
  issueDeliveryChallenge(config: {
    address: string
    token: string
    id: number
    gasPrice: BigNumber
  }): Promise<string>
  /** Make an on-chain transaction to initiate a state update challenge. */
  issueStateUpdateChallenge(config: {
    address: string
    gasPrice: BigNumber
    token?: string
    gasLimit?: number
  }): Promise<string>
  /** Make an on-chain transaction to recover funds whenever the commit-chain falls into recovery mode. */
  recoverFunds(config: { address: string; gasPrice: BigNumber; token?: string }): Promise<string>
  /** Register an address for a given token with the commit-chain. An address needs to be registered with the commit-chain for each token separately in order to send or receive transfers. This operation is done implicitly when sending a transfer if the address is not yet registered. Note that for a transfer to succeed the recipient need to have registered. */
  registerWallet(address: string, token?: string): Promise<void>
  /** Same like `registerWallet` function but it registered bulk of addresses at the same time */
  registerBulkWallets(wallets: { address: string; token?: string }[]): Promise<void>
  /** Clear socket events and cuts off the connection between nocust client and the server */
  shutdown(): void
  /** Subscribe/unsubscribe to incoming transfer */
  subscribe(config: {
    address: string
    token?: string
    event: 'TRANSFER_CONFIRMATION'
    callback: (data: Object) => void
  }): Function
  /**
   * Adds swap order
   */
  addOrder(config: {
    address: string
    baseTokenAddress: string
    quoteTokenAddress: string
    amount: BigNumber // Takes amount in big unit (Not Shifted)
    price: BigNumber // Takes price in big unit (Not Shifted)
    orderType: 'BUY' | 'SELL'
  }): Promise<Transaction>
  /**
   * Cancels open order
   */
  cancelOrder(address: string, id: number): Promise<void>
  /** Claims all auxilary wallet's fulfilled swap orders and returns a list of unfulfilled swaps. */
  getMyOrders(
    address: string,
    baseTokenAddress: string,
    quoteTokenAddress: string,
  ): Promise<MyOrder[]>
  /** Send a NOCUST transfer. */
  transfer(config: {
    from: string
    to: string
    amount: BigNumber
    token?: string
    nonce?: BigNumber
  }): Promise<Transaction>
  /** Deposits funds from main tokens addresses to any wallet address */
  transferParentChain(config: {
    from: string
    to: string
    token?: string
    amount: string
    gasPrice: string
  }): Promise<string>
  /** Make an on-chain transaction to initiate a withdrawal to remove the funds from the NOCUST smart contract and to get them at the specified address. The amount specified needs to be available for withdrawal . The withdrawal will have to be confirmed after a certain period of time (Currently between 36 and 72h). On the top the gas fee, this function will take an Ether fee from the on-chain balance for the commit-chain operator. */
  withdraw(config: {
    address: string
    amount: BigNumber
    gasPrice: string
    token?: string
  }): Promise<string>
  /** Signs terms of service agreement between wallet owner and operator owner */
  signToS(address: string): Promise<void>
  /** Prepares the address for doing swaps orders */
  setupTrading(address: string, baseTokenAddress: string, quoteTokenAddress: string): Promise<void>
}

export const nocust: NOCUST = {
  addPrivateKey,
  approveDeposits,
  buySLA,
  confirmWithdrawal,
  deposit,
  getBalance,
  getBlocksPerEon: () => store.blocksPerEon,
  getBlocksToWithdrawalConfirmation,
  getEon,
  getEra,
  getParentChainBalance,
  getOrderBook,
  getSLAInfo,
  getSLAStatus,
  getSupportedTokens,
  getTransfer,
  getTransfers,
  getWallet,
  getWithdrawalFee,
  getWithdrawalLimit,
  getLastSubmittedEon,
  hasOutstandingChallenges,
  init,
  isWalletRegistered,
  isRecoveryMode,
  issueDeliveryChallenge,
  issueStateUpdateChallenge,
  registerWallet,
  registerBulkWallets,
  recoverFunds,
  shutdown,
  subscribe,
  addOrder,
  cancelOrder,
  getMyOrders,
  transfer,
  transferParentChain,
  withdraw,
  signToS,
  setupTrading,
  isWalletRecovered,
}
