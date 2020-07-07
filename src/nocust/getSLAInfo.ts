import BigNumber from 'bignumber.js'

import { operator } from '../services/operator'

export interface SLAInfo {
  token: string
  price: BigNumber
  recipient: string
  monthlyLimit: number
}
export default async function getSLAInfo(): Promise<SLAInfo> {
  try {
    return await operator.getSLAInfo()
  } catch (e) {
    return Promise.reject(e)
  }
}
