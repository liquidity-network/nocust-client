import Web3 from 'web3'

import { createStore, store } from '../store'
import { blockchain } from '../services/blockchain'
import { websocket } from '../services/websocket'
import { nocust } from '.'
import { storage, StorageEngine } from '../services/storage'
import { contracts } from '../services/contracts'
import { NCError, NCErrorCode } from '../helpers/errors'
import { memoryStorage } from '..'
import { startHeartbeat } from '../services/heartbeat'

export type NOCUSTConfig = {
  contractAddress: string
  rpcUrl: string
  operatorUrl: string
  storageEngine?: StorageEngine
  privateKey?: string
  // In future user will be able to provide his implementation of sign
  // function not to pass his private key into library
  // sign: (address: string, data: string) => Promise<void>
}
export default async function init(config: NOCUSTConfig): Promise<void> {
  let { contractAddress, operatorUrl, rpcUrl, storageEngine, privateKey } = config

  if (!Web3.utils.isAddress(contractAddress.toLowerCase())) {
    throw new Error('Contract address is not valid')
  }

  if (operatorUrl === '' || operatorUrl == null) {
    throw new Error('Operator url is not valid')
  }

  if (rpcUrl === '' || rpcUrl == null) {
    throw new Error('RPC url is not valid')
  }

  createStore()

  store.contractAddress = contractAddress
  store.operatorUrl = operatorUrl
  store.rpcUrl = rpcUrl

  if (!storageEngine) {
    storageEngine = memoryStorage
    console.log('[NOCUST] Using memory storage, do not use it in production!')
  }

  storage.init(storageEngine)

  blockchain.init(rpcUrl, contractAddress)

  websocket.init(operatorUrl)

  if (privateKey) await nocust.addPrivateKey(privateKey)

  startHeartbeat()

  try {
    await Promise.all([
      blockchain.fetchNetworkId(),
      contracts.fetchGenesisBlock(),
      contracts.fetchBlocksPerEon(),
      contracts.fetchContractOwnerAddress(),
      contracts.fetchMinChallengeGasCost(),
      contracts.fetchSlackPeriod(),
      contracts.fetchExtendedSlackPeriod(),
      contracts.fetchEonsKept(),
      contracts.fetchDepositsKept(),
    ])
  } catch (e) {
    return Promise.reject(new NCError(NCErrorCode.INITIALIZATION_FAILED, '', { e }))
  }
}
