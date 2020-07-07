import BigNumber from 'bignumber.js'

import { nocust } from '.'

export default async function getWithdrawalLimit(
  address: string,
  token?: string,
): Promise<BigNumber> {
  try {
    const wallet = await nocust.getWallet(address, token)
    if (!wallet.previousEon) {
      return new BigNumber(0)
    }
    return BigNumber.min(wallet.previousEon.initialBalanceAllotment, wallet.currentEon.balance)
  } catch (e) {
    return Promise.reject(e)
  }
}
