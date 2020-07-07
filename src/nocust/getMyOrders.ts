import { store } from '../store'
import { operator } from '../services/operator'
import BigNumber from 'bignumber.js'
import getEon from './getEon'
import { remove0x } from '../helpers/utils'

type OrderStatus = 'pending' | 'cancelled' | 'complete' | 'expired'
export type MyOrder = {
  txId: string
  id: number
  time: number
  status: OrderStatus
  baseTokenAddress: string
  quoteTokenAddress: string
  amount: BigNumber
  price: BigNumber
  eon: number
  expiry?: number
  type: string
}
export default async function getMyOrders(
  address: string,
  baseTokenAddress: string,
  quoteTokenAddress: string,
): Promise<MyOrder[]> {
  const currentEon = await getEon()
  if (!store.swapWallets.get(address)) return
  const promises: Promise<MyOrder[]>[] = store.swapWallets.get(address).map(async subAddress => {
    let swaps = await operator.getTransfers({
      search: remove0x(subAddress),
      swap: true,
      ordering: 'time',
      limit: 1000,
    })

    // Filter out other token pairs
    swaps = swaps.filter(
      swap =>
        (swap.recipient.token === baseTokenAddress && swap.wallet.token === quoteTokenAddress) ||
        (swap.wallet.token === baseTokenAddress && swap.recipient.token === quoteTokenAddress),
    )

    const sortedSwaps = swaps.sort((a, b) => a.eon - b.eon)

    const swapDict: { [key: string]: MyOrder } = {}

    for (const swap of sortedSwaps) {
      const isBuy = swap.recipient.token === baseTokenAddress
      if (!swap.voided && swap.eon <= currentEon) {
        let status: OrderStatus = 'pending'
        if (swap.cancelled) {
          status = 'cancelled'
        }
        if (swap.complete) {
          status = 'complete'
        }

        swapDict[swap.txId] = {
          txId: swap.txId,
          id: swap.id,
          time: swap.time,
          baseTokenAddress,
          quoteTokenAddress,
          amount: isBuy ? swap.amountSwapped : swap.amount,
          price: isBuy
            ? swap.amount.dividedBy(swap.amountSwapped)
            : swap.amountSwapped.dividedBy(swap.amount),
          status,
          eon: swap.eon,
          type: isBuy ? 'Buy' : 'Sell',
        }
      }
    }
    return Object.keys(swapDict).map(txId => {
      const swapsByTxId = sortedSwaps.filter(swap => swap.txId === txId)
      const latestEonSwap = swapsByTxId.reverse()[0]
      const swap = swapDict[txId]
      if (swap.eon < currentEon && swap.status === 'pending') {
        swap.status = 'expired'
      }
      if (latestEonSwap.eon >= currentEon && swap.status === 'pending') {
        swap.expiry = latestEonSwap.eon - currentEon + 1
      }
      return swap
    })
  })

  const result = await Promise.all(promises)
  return result.reduce((total, arr) => {
    return total.concat(arr)
  }, [])
}
