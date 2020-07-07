import BigNumber from 'bignumber.js'
import { operator } from '../services/operator'
import { nocust } from './index'
import { store } from '../store'
import { NCError, NCErrorCode } from '../helpers/errors'
import { contracts } from '../services/contracts'

const RECOVER_FUNDS_GAS_LIMIT = 300000
export type RecoverFundsConfig = { address: string; gasPrice: BigNumber; token?: string }
export default async function recoverFunds(config: RecoverFundsConfig): Promise<string> {
  try {
    let { address, token, gasPrice } = config
    if (!token) token = store.contractAddress

    const lastSubmittedEon = await nocust.getLastSubmittedEon()

    const walletState = await operator.fetchWalletState({
      address,
      token,
      eon: lastSubmittedEon - 1,
    })

    const balance = new BigNumber(walletState.merkleProof.right).minus(
      new BigNumber(walletState.merkleProof.left),
    )
    if (balance.isEqualTo(new BigNumber(0))) {
      return Promise.reject(
        new NCError(
          NCErrorCode.CAN_NOT_RECOVER_FUNDS,
          'Cannot recover funds because commit chain balance is 0',
        ),
      )
    }

    const recoverAllFunds = await contracts.recoverAllFunds({
      token: config.token,
      address: config.address,
      activeStateChecksum: walletState.merkleProof.activeStateHash,
      trail: walletState.merkleProof.trail,
      round: walletState.merkleProof.eon,
      allotmentChain: walletState.merkleProof.allotmentChain,
      membershipChain: walletState.merkleProof.membershipChain,
      values: walletState.merkleProof.values.map(v => new BigNumber(v)),
      left: new BigNumber(walletState.merkleProof.left),
      right: new BigNumber(walletState.merkleProof.right),
      passiveChecksum: walletState.merkleProof.passiveHash,
      passiveAmount: new BigNumber(walletState.merkleProof.passiveAmount),
      passiveMarker: new BigNumber(walletState.merkleProof.passiveMarker),
      gas: RECOVER_FUNDS_GAS_LIMIT,
      gasPrice,
    })
    return recoverAllFunds
  } catch (e) {
    console.log('error', e)
    return Promise.reject(e)
  }
}
