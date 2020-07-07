import { blockchain } from '../services/blockchain'
import { store } from '../store'
import { NCError, NCErrorCode } from '../helpers/errors'

export type TransferParentChainConfig = {
  from: string
  to: string
  token?: string
  amount: string
  gasPrice: string
}
export default async function transferParentChain(
  config: TransferParentChainConfig,
): Promise<string> {
  const { from, to, token, amount, gasPrice } = config

  if (!blockchain.isPrivateKeyAdded(from)) {
    return Promise.reject(new NCError(NCErrorCode.NO_PRIVATE_KEY))
  }

  try {
    if (token === store.contractAddress || token == null) {
      const tx = await blockchain.sendEther({ from, to, amount, gasPrice })
      return tx.transactionHash
    } else {
      const tx = await blockchain.sendERC20({ from, to, token, amount, gasPrice })
      return tx.transactionHash
    }
  } catch (e) {
    return Promise.reject(e)
  }
}
