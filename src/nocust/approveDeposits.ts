import BigNumber from 'bignumber.js'

import { blockchain } from '../services/blockchain'
import { store } from '../store'
import { BN_2_256_MINUS_1 } from '../constants'

const APPROVE_GAS_LIMIT = 300000
export const APPROVE_AMOUNT = BN_2_256_MINUS_1.toFixed(0)

export type ApproveDepositsConfig = {
  address: string
  token: string
  gasPrice: BigNumber | string
}
export default async function approveDeposits(config: ApproveDepositsConfig): Promise<string> {
  const { address, token, gasPrice } = config

  try {
    const allowance = await blockchain.callERC20Method(token, 'allowance', [
      address,
      store.contractAddress,
    ])

    if (new BigNumber(allowance).isLessThan(APPROVE_AMOUNT)) {
      const result = await blockchain.sendERC20Method({
        address: config.address,
        token: config.token,
        name: 'approve',
        gasLimit: APPROVE_GAS_LIMIT,
        gasPrice: BigNumber.isBigNumber(gasPrice) ? gasPrice.toFixed(0) : gasPrice,
        params: [store.contractAddress, APPROVE_AMOUNT],
      })

      return result.transactionHash
    } else return Promise.reject(new Error('Deposits are already approved for this token'))
  } catch (e) {
    return Promise.reject(e)
  }
}
