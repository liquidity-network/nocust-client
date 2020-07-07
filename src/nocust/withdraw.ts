import BigNumber from 'bignumber.js'
import { nocust } from './index'
import { NCError, NCErrorCode } from '../helpers/errors'
import { contracts } from '../services/contracts'
import { blockchain } from '../services/blockchain'

export type WithdrawalConfig = {
  address: string
  amount: BigNumber
  gasPrice: string
  token?: string
}
export default async function withdraw(config: WithdrawalConfig): Promise<string> {
  // console.log('withdraw', config)
  const { address, token, amount, gasPrice } = config

  try {
    const limit = await nocust.getWithdrawalLimit(address, token)
    if (limit.isLessThan(amount)) {
      return Promise.reject(new NCError(NCErrorCode.INSUFFICIENT_WITHDRAWAL_LIMIT))
    }
  } catch (e) {
    return Promise.reject(e)
  }

  // TODO Check if there is enough ETH to pay for a gas

  try {
    const wallet = await nocust.getWallet(address, token)

    const tx = await contracts.requestWithdrawal({
      address,
      amount,
      gasPrice,
      proof: wallet.previousEon.proofOfExclusiveBalanceAllotment,
    })
    return tx
  } catch (e) {
    console.log('error', e)
    const hashPosition = e.message.indexOf('transactionHash')
    if (hashPosition > -1) {
      // get hash of reverted transaction
      const txId = e.message.substr(hashPosition + 19, 66)
      console.log('txId', txId)
      console.log('EVM revert reason:', await blockchain.fetchEVMRevertMessage(txId))
    }
  }

  return null
}
