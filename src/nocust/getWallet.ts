import { store } from '../store'
import { storage } from '../services/storage'
import { syncWallet, SyncWalletEvent } from '../wallet/syncWallet'
import { createWallet, getWallet, Wallet } from '../wallet'

export default async function getWalletNC(
  address: string,
  token?: string,
  parentAddress?: string,
): Promise<Wallet | null> {
  try {
    if (!token) token = store.contractAddress

    let wallet = getWallet(address, token)

    // No wallet in store, getting it from persistent storage
    if (!wallet) {
      wallet = await storage.retrieveWallet(address, token)

      // No wallet in storage also, trying to fetch it from operator + validate
      if (!wallet) {
        wallet = createWallet(address, token, parentAddress)
        await syncWallet(wallet, SyncWalletEvent.RECONSTRUCT)
      } else {
        await syncWallet(wallet, SyncWalletEvent.FULL_SYNC)
      }
    }

    return wallet
  } catch (e) {
    return Promise.reject(e)
  }
}
