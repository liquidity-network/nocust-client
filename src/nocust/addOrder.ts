import BigNumber from 'bignumber.js'
import { Transaction } from '../wallet/transaction'
import { store } from '../store'
import { NCError, NCErrorCode, NCServerErrorCode } from '../helpers/errors'
import { Wallet } from '../wallet'
import getWallet from './getWallet'
import { BN_ZERO } from '../constants'
import transfer from './transfer'
import { generateRandomNonce, sleep } from '../helpers/utils'
import { operator } from '../services/operator'
import { SyncWalletEvent, syncWallet } from '../wallet/syncWallet'
import { createSwapOrderSignatures } from '../services/swaps'

export type OrderConfig = {
  address: string
  baseTokenAddress: string
  quoteTokenAddress: string
  amount: BigNumber // Takes amount in big unit (Not Shifted)
  price: BigNumber // Takes price in big unit (Not Shifted)
  orderType: 'BUY' | 'SELL'
}
export default async function addOrder(config: OrderConfig): Promise<Transaction> {
  if (!store.swapWallets.has(config.address)) {
    return Promise.reject(
      new NCError(
        NCErrorCode.NO_TRADING_SETUP,
        'Please make sure setupTrading() is called before adding orders',
      ),
    )
  }
  const nonce = generateRandomNonce()
  const totalPrice = config.amount.multipliedBy(config.price)

  let { creditAmount, debitAmount } =
    config.orderType === 'BUY'
      ? { creditAmount: config.amount, debitAmount: totalPrice }
      : { creditAmount: totalPrice, debitAmount: config.amount }

  creditAmount = creditAmount.shiftedBy(18)
  debitAmount = debitAmount.shiftedBy(18)

  const { creditToken, debitToken } =
    config.orderType === 'BUY'
      ? { creditToken: config.baseTokenAddress, debitToken: config.quoteTokenAddress }
      : { creditToken: config.quoteTokenAddress, debitToken: config.baseTokenAddress }

  try {
    const { creditWallet, debitWallet } = await getAvailableSwapWallets(
      config.address,
      creditToken,
      debitToken,
    )
    await creditWallet.currentEon.finalizeAndHarvest()
    const fundAmount = debitAmount.minus(debitWallet.currentEon.balance)
    if (fundAmount.gt(BN_ZERO)) {
      await transfer({
        amount: fundAmount,
        from: config.address,
        to: debitWallet.address,
        token: debitToken,
      })
    } else if (fundAmount.lt(BN_ZERO)) {
      await transfer({
        amount: fundAmount.abs(),
        from: debitWallet.address,
        to: config.address,
        token: debitToken,
      })
    }
    const creditWalletBalance = creditWallet.currentEon.balance
    if (creditWalletBalance.gt(BN_ZERO)) {
      await transfer({
        amount: creditWalletBalance,
        from: creditWallet.address,
        to: config.address,
        token: creditToken,
      })
    }
    const {
      creditActiveStateSignatures,
      creditBalanceSignatures,
      debitActiveStateSignatures,
      debitBalanceSignatures,
      fulfillmentActiveStateSignatures,
    } = await createSwapOrderSignatures({
      creditWallet,
      debitWallet,
      creditAmount,
      debitAmount,
      nonce,
    })

    const swapPayload = await operator.sendSwapOrder({
      amount: debitAmount,
      amountSwapped: creditAmount,
      creditActiveStateSignatures,
      debitActiveStateSignatures,
      creditBalanceSignatures,
      debitBalanceSignatures,
      fulfillmentActiveStateSignatures,
      creditWallet,
      debitWallet,
      eon: debitWallet.currentEon.eon,
      nonce,
    })

    await syncWallet(creditWallet, SyncWalletEvent.SYNC_TRANSACTIONS, { payloads: [swapPayload] })
    await syncWallet(debitWallet, SyncWalletEvent.SYNC_TRANSACTIONS, { payloads: [swapPayload] })

    return creditWallet.currentEon.transactions.find(t => t.id === swapPayload.id)
  } catch (e) {
    if (e.message === NCServerErrorCode.EON_NUMBER_OUT_OF_SYNC) {
      // Either we submitted transfer with old eon information or checkpoint is not submitted yet by server
      // Hack - rry again recursively within 2 seconds
      // TODO Rewrite with better solution - it is possible to submit transfer even if operator
      //  did not submit checkpoint of previous eon yet
      await sleep(2000)
      const { creditWallet, debitWallet } = await getAvailableSwapWallets(
        config.address,
        creditToken,
        debitToken,
      )
      await syncWallet(creditWallet, SyncWalletEvent.FULL_SYNC)
      await syncWallet(debitWallet, SyncWalletEvent.FULL_SYNC)
      return addOrder(config)
      // return Promise.reject(e)
    } else return Promise.reject(e)
  }
}

async function getAvailableSwapWallets(
  address: string,
  creditToken: string,
  debitToken: string,
): Promise<{ creditWallet: Wallet; debitWallet: Wallet }> {
  try {
    const swapWalletAddresses = store.swapWallets.get(address)

    for (let i = 0; i < swapWalletAddresses.length; i++) {
      const creditWallet = await getWallet(swapWalletAddresses[i], creditToken, address)
      const debitWallet = await getWallet(swapWalletAddresses[i], debitToken, address)

      if (
        creditWallet.currentEon.isAvailableForSwaps &&
        debitWallet.currentEon.isAvailableForSwaps
      ) {
        return { creditWallet, debitWallet }
      }
    }
    return Promise.reject(new NCError(NCErrorCode.SWAP_LIMIT_REACHED_ERROR))
  } catch (e) {
    return Promise.reject(e)
  }
}
