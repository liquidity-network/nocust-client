import BigNumber from 'bignumber.js'
import RunDeliveryChallenge from '../services/challenges/deliveryChallenge'

export type DeliveryChallengeConfig = {
  address: string
  token: string
  id: number
  gasPrice: BigNumber
}
export default async function issueDeliveryChallenge(
  config: DeliveryChallengeConfig,
): Promise<string> {
  try {
    await RunDeliveryChallenge(config)
  } catch (e) {
    return Promise.reject(e)
  }
}
