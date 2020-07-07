import { getToSHash } from '../store'
import { operator } from '../services/operator'
import { blockchain } from '../services/blockchain'

export async function signToS(address: string): Promise<void> {
  try {
    const tosHash = await getToSHash()
    const tosSignature = await blockchain.sign(address, tosHash)
    await operator.postToSSignature(address, tosSignature)
  } catch (e) {
    return Promise.reject(e)
  }
}
