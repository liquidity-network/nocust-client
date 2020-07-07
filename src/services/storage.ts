import JSONBigInt from 'json-bigint'

import { store } from '../store'
import { parseWallet } from '../wallet/parseWallet'
import { defineWalletKey } from '../helpers/utils'
import { getWallet, Wallet } from '../wallet'

export interface StorageEngine {
  get(key: string): Promise<string>
  set(key: string, value: string): Promise<boolean>
  delete(key: string): Promise<boolean>
  [T: string]: any
}

let storageEngine: StorageEngine

function init(engine: StorageEngine) {
  storageEngine = engine
}

async function retrieveWallet(address: string, token: string): Promise<Wallet | null> {
  try {
    const keyConfig = { address, token, contract: store.contractAddress, network: store.networkId }
    const walletData = await storageEngine.get(defineKey(keyConfig))
    return walletData ? parseWallet(walletData) : null
  } catch (e) {
    console.log(e)
    return null
  }
}

const queue: Set<string> = new Set<string>()

function queueWalletStorage(wallet: Wallet) {
  queue.add(defineWalletKey(wallet.address, wallet.token))
}

async function storeQueuedWallets() {
  for (const key of queue) {
    try {
      const [token, address] = key.split('/')
      const wallet = getWallet(address, token)
      const keyConfig = {
        address: wallet.address,
        token: wallet.token,
        contract: store.contractAddress,
        network: store.networkId,
      }
      // log('stringified wallet', JSONBigInt.stringify(wallet))
      await storageEngine.set(defineKey(keyConfig), JSONBigInt.stringify(wallet))
      queue.delete(key)
    } catch (e) {
      console.log(`[INTERNAL] Error storing wallet(${key}) to storage`, e)
    }
  }
}

type KeyConfig = { address: string; token: string; contract: string; network: number }
const defineKey = (config: KeyConfig) =>
  config.contract + '/' + config.network + '/' + config.address + '/' + config.token

export const storage = {
  init,
  queueWalletStorage,
  retrieveWallet,
  storeQueuedWallets,
}
