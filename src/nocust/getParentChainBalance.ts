import BigNumber from 'bignumber.js'

import { blockchain } from '../services/blockchain'
import { store } from '../store'

export default async function getParentChainBalance(
  address: string,
  token?: string,
): Promise<BigNumber> {
  try {
    if (!token || token === store.contractAddress) {
      return await blockchain.getETHBalance(address)
    } else {
      return await blockchain.getERC20Balance(address, token)
    }
  } catch (e) {
    return Promise.reject(e)
  }
}
