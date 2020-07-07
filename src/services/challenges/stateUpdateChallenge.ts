import BigNumber from 'bignumber.js'
import { contracts } from '../contracts'
import { nocust } from '../../nocust'
import { NCError, NCErrorCode } from '../../helpers/errors'
import { Wallet } from '../../wallet'
import { EMPTY_SIGNATURE } from '../../constants'
import { store } from '../../store'

export async function runChallengeChecks(wallet: Wallet): Promise<void> {
  try {
    const currentEra = await nocust.getEra()
    if (currentEra < store.blocksPerEon / 4) {
      return Promise.reject(
        new NCError(
          NCErrorCode.CAN_NOT_ISSUE_STATE_UPDATE_CHALLENGE,
          `Cannot initiate state update challenge in the first quarter of an eon, you can try again in ${store.blocksPerEon /
            4 -
            currentEra} blocks`,
        ),
      )
    }

    if (wallet.registrationEon === wallet.currentEon.eon) {
      return Promise.reject(
        new NCError(
          NCErrorCode.CAN_NOT_ISSUE_STATE_UPDATE_CHALLENGE,
          'Wallet is in registeration eon',
        ),
      )
    }
    if (!wallet.previousEon) {
      return Promise.reject(
        new NCError(NCErrorCode.CAN_NOT_ISSUE_STATE_UPDATE_CHALLENGE, 'Wallet has no previous eon'),
      )
    }
    if (
      wallet.registrationEon < wallet.previousEon.eon &&
      !wallet.previousEon.proofOfExclusiveBalanceAllotment
    ) {
      return Promise.reject(
        new NCError(
          NCErrorCode.CAN_NOT_ISSUE_STATE_UPDATE_CHALLENGE,
          "Wallet's previous eon missing proof of exclussive alottment",
        ),
      )
    }
    const challengeBook = await contracts.getWalletChallenges(wallet.address, wallet.token)
    const stateUpdateChallengeIssued = parseInt(challengeBook[0].valueOf(), 10) > 0
    const stateUpdateChallengeEonsKept = parseInt(challengeBook[2].valueOf(), 10)

    if (stateUpdateChallengeIssued || stateUpdateChallengeEonsKept >= wallet.currentEon.eon - 1) {
      return Promise.reject(
        new NCError(
          NCErrorCode.CAN_NOT_ISSUE_STATE_UPDATE_CHALLENGE,
          'Wallet has already issued an update challenge',
        ),
      )
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

export default async function issueStateUpdateChallenge(
  address: string,
  token: string,
  gas: number,
  gasPrice: BigNumber,
): Promise<any> {
  try {
    const wallet = await nocust.getWallet(address, token)
    await runChallengeChecks(wallet)
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

    const { spent: prevSpent, gained: prevGained } = wallet.previousEon.spentAndGained
    if (wallet.previousEon.proofOfExclusiveBalanceAllotment) {
      return contracts.submitInitialMerkleStateChallenge({
        address: wallet.address,
        proof: wallet.previousEon.proofOfExclusiveBalanceAllotment,
        spent: prevSpent,
        gained: prevGained,
        operatorSignature,
        gas,
        gasPrice,
        txSetRoot: wallet.previousEon.activeState.transactionSetHash,
      })
    } else {
      return contracts.submitInitialEmptyStateChallenge({
        address: wallet.address,
        token: wallet.token,
        trailIdentifier: wallet.trailIdentifier,
        spent: prevSpent,
        gained: prevGained,
        operatorSignature,
        gas,
        gasPrice,
        txSetRoot: wallet.previousEon.activeState.transactionSetHash,
      })
    }
  } catch (e) {
    console.log(e)
    return Promise.reject(e)
  }
}
