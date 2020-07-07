import BigNumber from 'bignumber.js'
import RunStateUpdateChallenge from '../services/challenges/stateUpdateChallenge'
import { store } from '../store'

const STATE_UPDATE_GAS_LIMIT = 400000

export type StateUpdateChallengeConfig = {
  address: string
  gasPrice: BigNumber
  token?: string
  gasLimit?: number
}
export default async function issueStateUpdateChallenge(
  config: StateUpdateChallengeConfig,
): Promise<string> {
  try {
    let { address, token, gasPrice, gasLimit } = config
    if (!token) token = store.contractAddress
    const challengeResponse = await RunStateUpdateChallenge(
      address,
      token,
      gasLimit || STATE_UPDATE_GAS_LIMIT,
      gasPrice,
    )
    return challengeResponse.transactionHash
  } catch (e) {
    return Promise.reject(e)
  }
}
