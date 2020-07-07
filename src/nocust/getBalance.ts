import BigNumber from 'bignumber.js'
import { nocust } from '.'

export default async function getBalance(address: string, token?: string): Promise<BigNumber> {
  try {
    const wallet = await nocust.getWallet(address, token)
    return wallet.currentEon.balance
  } catch (e) {
    return Promise.reject(e)
  }
}
