import { operator, TransactionsParams } from '../services/operator'
import { transformTransactionFromServer } from '../services/operator/transformers'
import { Transaction } from '../wallet/transaction'

// TODO Need to improve when /audit/transfers/ endpoint will be improved
export default async function getTransfers(params: TransactionsParams): Promise<Transaction[]> {
  try {
    const transfers = await operator.getTransfers(params)
    return transfers.map(transformTransactionFromServer)
  } catch (e) {
    return Promise.reject(e)
  }
}
