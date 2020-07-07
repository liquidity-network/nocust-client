import BigNumber from 'bignumber.js'
// import { contracts } from '../contracts'
import getWallet from '../../nocust/getWallet'
import { NCError, NCErrorCode } from '../../helpers/errors'
import { Wallet } from '../../wallet'
import { isSameHexValue } from '../../helpers/utils'
import { TransactionPayload } from '../operator/payloads'
import { operator } from '../operator'
import { contracts } from '../contracts'
import { EMPTY_SIGNATURE } from '../../constants'

const CHALLENGE_GAS_LIMIT = 300000

type IssueDeliveryChallenge = {
  address: string
  token: string
  id: number
  gasPrice: BigNumber
}

export async function deliveryChallengeChekcer(wallet: Wallet, id: number) {
  try {
    if (wallet.registrationEon === wallet.currentEon.eon) {
      return Promise.reject(
        new NCError(NCErrorCode.CAN_NOT_ISSUE_DELIVERY_CHALLENGE, 'Wallet is in registeration eon'),
      )
    }
    if (!wallet.previousEon) {
      return Promise.reject(
        new NCError(NCErrorCode.CAN_NOT_ISSUE_DELIVERY_CHALLENGE, 'Wallet has no previous eon'),
      )
    }

    const transfer = wallet.previousEon.transactions.find(x => x.id === id)
    if (!transfer) {
      return Promise.reject(
        new NCError(
          NCErrorCode.CAN_NOT_ISSUE_DELIVERY_CHALLENGE,
          `Could not find relevant transfer data for txId ${id}. Only transfers from the previous eonNumber can be challenged.`,
        ),
      )
    }
    if (
      !isSameHexValue(wallet.address, transfer.sender.address) &&
      !isSameHexValue(wallet.address, transfer.recipient.address)
    ) {
      return Promise.reject(
        new NCError(NCErrorCode.CAN_NOT_ISSUE_DELIVERY_CHALLENGE, 'Not the owner of the transfer'),
      )
    }
  } catch (e) {
    return Promise.reject(e)
  }

  return true
}

export default async function issueDeliveryChallenge(
  config: IssueDeliveryChallenge,
): Promise<void> {
  try {
    const { address, token, id, gasPrice } = config
    const wallet = await getWallet(address, token)
    await deliveryChallengeChekcer(wallet, id)

    const transfer: TransactionPayload = await operator.getTransfer(id)

    const isOutgoing = isSameHexValue(wallet.address, transfer.recipient.address)

    const { spent, gained } = wallet.previousEon.spentAndGained

    const prevEonLastTransaction = wallet.previousEon.lastTransaction
    let operatorSignature = EMPTY_SIGNATURE
    if (prevEonLastTransaction) {
      const isOutgoing =
        wallet.address === prevEonLastTransaction.sender.address &&
        wallet.token === prevEonLastTransaction.sender.token
      operatorSignature = isOutgoing
        ? prevEonLastTransaction.senderActiveState.operatorSignature
        : prevEonLastTransaction.recipientActiveState.operatorSignature
    } else if (wallet.previousEon.eon === wallet.registrationEon) {
      operatorSignature = wallet.operatorRegistrationSignature
    }

    return contracts.submitDeliveryChallenge({
      tokenAddress: token,
      address,
      senderAddress: transfer.wallet.address,
      recipientAddress: transfer.recipient.address,
      nonce: new BigNumber(transfer.nonce),
      senderTrailIdentifier: isOutgoing
        ? wallet.trailIdentifier
        : transfer.recipient.trailIdentifier,
      transferMembershipTrail: transfer.deliveryProof.transferMembershipTrail,
      recipientTrailIdentifier: transfer.recipient.trailIdentifier,
      chain: transfer.deliveryProof.transferMembershipChain,
      txSetRoot: wallet.previousEon.activeState.transactionSetHash,
      spent,
      gained,
      amount: transfer.amount,
      operatorSignature,
      gas: CHALLENGE_GAS_LIMIT,
      gasPrice,
    })
  } catch (e) {
    console.log(e)
    return Promise.reject(e)
  }
}
