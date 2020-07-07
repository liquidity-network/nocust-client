import { store } from '../store'
import { defineWalletKey } from '../helpers/utils'
import { storage } from '../services/storage'
import { RegistrationPayload } from '../services/operator/payloads'
import { createSignature, Signature } from './signature'
import { Eon } from './eon'

export interface Wallet {
  address: string
  token: string

  isRegistered: boolean
  registrationEon?: number
  trailIdentifier?: number
  registrationSignature?: Signature
  operatorRegistrationSignature?: Signature
  // parentAddress only exists in swap wallets to point to
  // the main wallet address
  parentAddress?: string
  currentEon?: Eon
  previousEon?: Eon
}

export type WalletId = { address: string; token: string; trailIdentifier: number }

export const getWallet = (address: string, token: string) =>
  store.wallets.get(defineWalletKey(address, token))

export function updateWallet(wallet: Wallet) {
  store.wallets.set(defineWalletKey(wallet.address, wallet.token), wallet)

  storage.queueWalletStorage(wallet)
}

export const createWallet = (address: string, token: string, parentAddress?: string): Wallet => ({
  address,
  token,
  isRegistered: false,
  parentAddress,
})

export function fillWalletRegistration(
  wallet: Wallet,
  data: RegistrationPayload & { hash: string },
) {
  if (wallet.isRegistered) throw new Error('[INTERNAL] Wallet is already registered!')

  wallet.registrationSignature = createSignature(wallet.address, data.hash, data.walletSignature)
  wallet.operatorRegistrationSignature = createSignature(
    store.contractOwner,
    data.hash,
    data.operatorSignature,
  )
  wallet.isRegistered = true
  wallet.registrationEon = data.eon
  wallet.trailIdentifier = data.trailIdentifier

  wallet.currentEon = new Eon(wallet, data.eon)
}
