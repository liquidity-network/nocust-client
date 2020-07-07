import { contracts } from '../services/contracts'
import { store } from '../store'

export interface IsWalletRecovered {
  address: string
  token?: string
}
export default async function isWalletRecovered(config: IsWalletRecovered): Promise<boolean> {
  try {
    let { address, token } = config
    console.log('config', config)

    if (!token) token = store.contractAddress
    const isWalletRecovered = await contracts.checkIsWalletRecovered(address, token)
    return isWalletRecovered
  } catch (e) {
    return Promise.reject(e)
  }
}
