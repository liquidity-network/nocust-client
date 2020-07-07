import { operator } from '../services/operator'
import { Transaction } from '../wallet/transaction'
import { transformTransactionFromServer } from '../services/operator/transformers'

export default async function getTransfer(id: number): Promise<Transaction> {
  try {
    const transfer = await operator.getTransfer(id)
    return transformTransactionFromServer(transfer)
  } catch (e) {
    return Promise.reject(e)
  }
}
