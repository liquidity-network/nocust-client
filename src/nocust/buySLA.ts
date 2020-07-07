import { nocust } from '.'
import { Transaction } from '../wallet/transaction'
import { NCError, NCErrorCode } from '../helpers/errors'
import { operator } from '../services/operator'

export default async function buySLA(address: string): Promise<Transaction> {
  try {
    const status = await nocust.getSLAStatus(address)
    if (status > 0) return Promise.reject(new NCError(NCErrorCode.SLA_NOT_EXPIRED_YET))

    const slaInfo = await nocust.getSLAInfo()

    const { token, recipient: to, price: amount } = slaInfo
    const tx = await nocust.transfer({ from: address, token, to, amount })
    await operator.postSLA(address, tx.id)
    return tx
  } catch (e) {
    return Promise.reject(e)
  }
}
