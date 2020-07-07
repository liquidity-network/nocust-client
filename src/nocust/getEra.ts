import { blockchain } from '../services/blockchain'
import { store } from '../store'

export default async function getEra(): Promise<number> {
  try {
    const latestBlock = await blockchain.getBlockNumber()

    return (latestBlock - store.genesisBlock) % store.blocksPerEon
  } catch (e) {
    return Promise.reject(e)
  }
}
