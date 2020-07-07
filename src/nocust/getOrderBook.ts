import { OrderPayload } from '../services/operator/payloads'
import BigNumber from 'bignumber.js'
import { operator } from '../services/operator'

export interface Order {
  amount: BigNumber
  price: BigNumber
}

export interface OrderBook {
  buyOrders: Order[]
  sellOrders: Order[]
}

export default async function getOrderBook(
  baseTokenAddress: string,
  quoteTokenAddress: string,
): Promise<OrderBook> {
  const { buyOrders, sellOrders } = await operator.getOrderbook(baseTokenAddress, quoteTokenAddress)
  return {
    buyOrders: buyOrders.map(order => orderMapper(order, true)),
    sellOrders: sellOrders.map(order => orderMapper(order, false)),
  }
}

function orderMapper(order: OrderPayload, isBuy: boolean): Order {
  const { amount, amountSwapped, remainingOut, remainingIn } = order
  const price = isBuy ? amount.dividedBy(amountSwapped) : amountSwapped.dividedBy(amount)
  const remainingAmount = isBuy ? remainingIn : remainingOut
  return {
    amount: remainingAmount.shiftedBy(-18),
    price,
  }
}
