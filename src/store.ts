import BigNumber from 'bignumber.js'

import { SLAInfo } from './nocust/getSLAInfo'
import { Wallet } from './wallet'
import Web3 from 'web3'
import { operator } from './services/operator'

class AppStore {
  // CONFIG SLICE
  contractAddress: string
  rpcUrl: string
  operatorUrl: string
  networkId: number
  tosHash: string

  // CONTRACT SLICE
  genesisBlock: number
  blocksPerEon: number
  slackPeriod: number
  extendedSlackPeriod: number
  eonsKept: number
  depositsKept: number
  contractOwner: string
  minChallengeGasCost: BigNumber

  // WALLETS
  wallets: Map<string, Wallet> = new Map<string, Wallet>()

  // SWAP WALLETS ADDRESSES
  swapWallets: Map<string, string[]> = new Map<string, string[]>()

  // SLA
  slaInfo: SLAInfo | undefined
}

export let store: AppStore

export const createStore = () => {
  store = new AppStore()
}

export const getToSHash = async (): Promise<string> => {
  try {
    if (!store.tosHash) {
      const { privacyPolicyDigest, termsOfServiceDigest } = await operator.getToSDigests()
      store.tosHash = Web3.utils
        .soliditySha3({ type: 'bytes', value: termsOfServiceDigest + privacyPolicyDigest })
        .toString()
    }
    return store.tosHash
  } catch (e) {
    return Promise.reject(e)
  }
}
