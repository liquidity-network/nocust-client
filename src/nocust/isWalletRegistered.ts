import { operator } from '../services/operator'
import { store } from '../store'

export default async function isWalletRegistered(
  address: string,
  token?: string,
): Promise<boolean> {
  if (!token) token = store.contractAddress

  try {
    await operator.getWalletRegistration(address, token)
    return true
  } catch (e) {
    return false
  }
}
