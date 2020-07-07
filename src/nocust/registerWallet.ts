import { store, getToSHash } from '../store'
import { operator } from '../services/operator'
import { Signature } from '../wallet/signature'
import { blockchain } from '../services/blockchain'
import { websocket, WSEventType } from '../services/websocket'
import { hashActiveState } from '../wallet/activeState'
import { NCError, NCErrorCode } from '../helpers/errors'
import { createWallet, fillWalletRegistration, updateWallet } from '../wallet'
import { EMPTY_HASH, BN_ZERO } from '../constants'

export default async function registerWallet(address: string, token?: string): Promise<void> {
  try {
    if (!token) token = store.contractAddress

    if (!blockchain.isPrivateKeyAdded(address)) {
      return Promise.reject(new NCError(NCErrorCode.NO_PRIVATE_KEY))
    }

    const wallet = createWallet(address, token)

    const status = await operator.getStatus()
    const { eon } = status.latest

    const hash = hashActiveState({
      token,
      address,
      eon,
      trailIdentifier: 0,
      transactionSetHash: EMPTY_HASH,
      spent: BN_ZERO,
      gained: BN_ZERO,
    })

    const tosHash = await getToSHash()
    const tosSignature = await blockchain.sign(address, tosHash)
    const authSignature: Signature = await blockchain.sign(address, hash)

    // TODO Change all() to allSettled(), and check if waitForEvent has been rejected
    //  with timeout while registerWallet succeed, then try to fetch registration
    //  data with endpoint(websocket message has been lost)
    const [websocketData] = await Promise.all([
      websocket.waitForEvent({
        event: WSEventType.REGISTRATION_CONFIRMATION,
        address,
        token,
        timeout: 20,
      }),
      operator.registerWallet(wallet, authSignature, tosSignature),
    ])

    if (wallet.address !== websocketData.address || wallet.token !== websocketData.token) {
      return Promise.reject(
        new Error('[INTERNAL] WebSocket registration data does not fit request'),
      )
    }

    fillWalletRegistration(wallet, { ...websocketData.registration, hash })

    updateWallet(wallet)

    return websocketData
  } catch (e) {
    return Promise.reject(e)
  }
}
