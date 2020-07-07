import { web3 } from '../services/blockchain'
import { nocust } from './index'
import { NCError, NCErrorCode } from '../helpers/errors'
import { store } from '../store'

export default async function getBlocksToWithdrawalConfirmation(txHash: string): Promise<number> {
  try {
    const currentEon = await nocust.getEon()
    const eraNumber = await nocust.getEra()

    let onChainTxReceipt
    try {
      onChainTxReceipt = await web3.eth.getTransactionReceipt(txHash)
    } catch (err) {
      return Promise.reject(
        err.code
          ? err
          : new NCError(
              NCErrorCode.TX_HASH_NOT_FOUND,
              'Could not get on-chain transaction receipt',
            ),
      )
    }
    const withdrawalEon: number =
      Math.floor((onChainTxReceipt.blockNumber - store.genesisBlock) / store.blocksPerEon) + 1

    const roundsPassed = currentEon - withdrawalEon

    return Math.max(
      Number(store.extendedSlackPeriod) + store.blocksPerEon * (2 - roundsPassed) - eraNumber + 1,
      0,
    )
  } catch (e) {
    return Promise.reject(e)
  }
}
