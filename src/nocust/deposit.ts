import BigNumber from 'bignumber.js'

import { isSameHexValue } from '../helpers/utils'
import { store } from '../store'
import { blockchain } from '../services/blockchain'
import { NCError, NCErrorCode } from '../helpers/errors'
import { contracts } from '../services/contracts'
import { nocust } from '.'

export type DepositConfig = {
  address: string
  amount: BigNumber
  gasPrice: string
  token?: string
  nonce?: number
}
export default async function deposit(config: DepositConfig): Promise<string> {
  let { address, token, amount, gasPrice, nonce } = config
  if (!token) token = store.contractAddress
  if (!isSameHexValue(token, store.contractAddress)) {
    try {
      const allowance = await blockchain.callERC20Method(token, 'allowance', [
        address,
        store.contractAddress,
      ])

      if (new BigNumber(allowance).isLessThan(amount)) {
        return Promise.reject(new NCError(NCErrorCode.INSUFFICIENT_TRANSFER_ALLOWANCE))
      }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  try {
    const balance = await nocust.getParentChainBalance(address, token)
    if (balance.isLessThan(amount)) {
      return Promise.reject(new NCError(NCErrorCode.INSUFFICIENT_PARENT_CHAIN_BALANCE))
    }

    const isRegistered = await nocust.isWalletRegistered(address, token)
    if (!isRegistered) return Promise.reject(new NCError(NCErrorCode.WALLET_UNREGISTERED))
  } catch (e) {
    return Promise.reject(e)
  }

  try {
    const tx: any = await contracts.deposit({ address, token, amount, gasPrice, nonce })
    return Promise.resolve(tx.transactionHash)
  } catch (e) {
    console.log(e.message)
    return Promise.reject(new NCError(NCErrorCode.PARENT_CHAIN_TRANSACTION_FAILURE, e.message, e))
  }
}
