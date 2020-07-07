import { blockchain } from '../services/blockchain'
import { store } from '../store'

export default async function getEon(): Promise<number> {
  try {
    const latestBlock = await blockchain.getBlockNumber()

    return Math.floor((latestBlock - store.genesisBlock) / store.blocksPerEon) + 1
  } catch (e) {
    return Promise.reject(e)
  }
}
