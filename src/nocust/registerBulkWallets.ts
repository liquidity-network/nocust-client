import { operator, RegisterationConfig } from '../services/operator'
import { blockchain } from '../services/blockchain'
import { getToSHash, store } from '../store'
import { Wallet, createWallet, fillWalletRegistration, updateWallet } from '../wallet'
import { hashActiveState } from '../wallet/activeState'
import { EMPTY_HASH, BN_ZERO } from '../constants'
import { websocket, WSEventType } from '../services/websocket'

type WalletConfig = { address: string; token?: string; parentAddress?: string }
export default async function registerBulkWallets(walletsConfig: WalletConfig[]): Promise<void> {
  try {
    const status = await operator.getStatus()
    const { eon } = status.latest
    const tosHash = await getToSHash()
    const unregisteredWallets: WalletConfig[] = []
    await Promise.all(
      walletsConfig.map(wallet =>
        operator.getWalletRegistration(wallet.address, wallet.token).catch(() => {
          unregisteredWallets.push(wallet)
        }),
      ),
    )
    if (unregisteredWallets.length > 0) {
      const bulkRequestConfig = await Promise.all(
        unregisteredWallets.map(config => prepareBulkRegistrationConfig(config, tosHash, eon)),
      )
      const wsNotificationsData: any = []
      const wsNotificationPromises = unregisteredWallets.map(config =>
        websocket
          .waitForEvent({
            event: WSEventType.REGISTRATION_CONFIRMATION,
            address: config.address,
            token: config.token || store.contractAddress,
          })
          .then(websocketData => {
            wsNotificationsData.push(websocketData)
          }),
      )
      await Promise.all([
        ...wsNotificationPromises,
        operator.registerBulkWallets(bulkRequestConfig),
      ])
      bulkRequestConfig.forEach((config, index) => {
        fillWalletRegistration(config.wallet, {
          ...wsNotificationsData[index].registration,
          hash: config.authHash,
        })
        updateWallet(config.wallet)
      })
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

async function prepareBulkRegistrationConfig(
  config: WalletConfig,
  tosHash: string,
  eon: number,
): Promise<RegisterationConfig & { authHash: string }> {
  const wallet: Wallet = createWallet(
    config.address,
    config.token || store.contractAddress,
    config.parentAddress,
  )
  const authHash = hashActiveState({
    token: config.token || store.contractAddress,
    address: config.address,
    eon,
    trailIdentifier: 0,
    transactionSetHash: EMPTY_HASH,
    spent: BN_ZERO,
    gained: BN_ZERO,
  })
  const tosSignature = await blockchain.sign(config.address, tosHash)
  const authSignature = await blockchain.sign(config.address, authHash)
  return {
    wallet,
    tosSignature,
    authSignature,
    authHash,
  }
}
