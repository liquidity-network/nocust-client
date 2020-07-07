import BigNumber from 'bignumber.js'

import {
  Transaction,
  hashTransfer,
  TransferHashConfig,
  transactionToMerkleTree,
} from '../wallet/transaction'
import { nocust } from '.'
import { store } from '../store'
import { NCError, NCErrorCode, NCServerErrorCode } from '../helpers/errors' // prettier-ignore
import { generateRandomNonce, isSameHexValue, sleep } from '../helpers/utils'
import { operator } from '../services/operator'
import { blockchain } from '../services/blockchain'
import { hashActiveState, ActiveState } from '../wallet/activeState'
import { BalanceMarker, hashBalanceMarker } from '../wallet/balanceMarker'
import { checkRegistration } from '../wallet/checks'
import { syncWallet, SyncWalletEvent } from '../wallet/syncWallet'
import { constructMerkleTree, MerkleTree } from '../wallet/merkleTree'
import { getWallet } from '../wallet'

export type TransferConfig = {
  from: string
  to: string
  amount: BigNumber
  token?: string
  nonce?: BigNumber
}
export default async function transfer(config: TransferConfig): Promise<Transaction> {
  let { from, to, token, amount, nonce } = config

  if (!token) token = store.contractAddress

  if (isSameHexValue(from, to)) return Promise.reject(new NCError(NCErrorCode.TRANSFER_TO_SELF))

  const wallet = await nocust.getWallet(from, token)

  const { currentEon } = wallet

  if (currentEon.balance.isLessThan(amount)) {
    return Promise.reject(new NCError(NCErrorCode.INSUFFICIENT_COMMIT_CHAIN_BALANCE))
  }

  const registrationData = await operator.getWalletRegistration(to, token)
  if (!registrationData) return Promise.reject(new NCError(NCErrorCode.WALLET_UNREGISTERED))

  checkRegistration(to, token, registrationData)

  if (!nonce) nonce = generateRandomNonce()

  const proposedTransfer: TransferHashConfig = {
    senderAddress: from,
    recipientAddress: to,
    recipientTrailIdentifier: registrationData.trailIdentifier,
    amount,
    nonce,
    isOutgoing: true,
  }
  const proposedTransferNode: MerkleTree = { height: 0, hash: hashTransfer(proposedTransfer) }
  const transactionSetNodes: MerkleTree[] = [
    ...currentEon.activeTransactions.map(t => transactionToMerkleTree(t, wallet)),
    proposedTransferNode,
  ]
  const transactionSetHash = constructMerkleTree(transactionSetNodes).hash
  const balanceMarker: BalanceMarker = {
    address: wallet.address,
    token,
    eon: currentEon.eon,
    balance: currentEon.balance.minus(amount).toFixed(0),
  }
  const activeState: ActiveState = {
    ...currentEon.activeState,
    spent: currentEon.activeState.spent.plus(amount),
    transactionSetHash,
  }
  const [activeStateSignature, balanceMarkerSignature] = await Promise.all([
    blockchain.sign(wallet.address, hashActiveState(activeState)),
    blockchain.sign(wallet.address, hashBalanceMarker(balanceMarker)),
  ])

  try {
    const transferPayload = await operator.sendTransfer({
      activeStateSignature,
      balanceMarkerSignature,
      balanceMarker,
      amount: proposedTransfer.amount,
      senderAddress: from,
      recipientAddress: to,
      eon: wallet.currentEon.eon,
      nonce,
      tokenAddress: token,
    })

    await syncWallet(wallet, SyncWalletEvent.SYNC_TRANSACTIONS, { payloads: [transferPayload] })
    const recipientWallet = getWallet(to, token)
    if (recipientWallet) {
      await syncWallet(recipientWallet, SyncWalletEvent.SYNC_TRANSACTIONS, {
        payloads: [transferPayload],
      })
    }
    return wallet.currentEon.transactions.find(t => t.id === transferPayload.id)
  } catch (e) {
    if (e.message === NCServerErrorCode.EON_NUMBER_OUT_OF_SYNC) {
      // Either we submitted transfer with old eon information or checkpoint is not submitted yet by server
      // Hack - rry again recursively within 2 seconds
      // TODO Rewrite with better solution - it is possible to submit transfer even if operator
      //  did not submit checkpoint of previous eon yet
      await sleep(2000)
      await syncWallet(wallet, SyncWalletEvent.FULL_SYNC)
      return transfer(config)
      // return Promise.reject(e)
    } else return Promise.reject(e)
  }
}
