import { keccak256, toBuffer, publicToAddress, toChecksumAddress } from 'ethereumjs-util'
import * as bip39 from 'bip39'
// @ts-ignore
import HDKey from 'ethereumjs-wallet/hdkey'
// @ts-ignore
import EthWallet from 'ethereumjs-wallet'
import { blockchain } from '../services/blockchain'
import { SEED_MESSAGE, SWAP_COUNT } from '../constants'
import { signatureToRSV } from '../wallet/signature'
import { operator } from '../services/operator'
import { RegistrationPayload } from '../services/operator/payloads'
import { nocust } from '../nocust'
import { Wallet, createWallet } from '../wallet'
import { store } from '../store'

export default async function init(
  address: string,
  baseTokenAddress: string,
  quoteTokenAddress: string,
): Promise<void> {
  // Check if swap wallets are already in the store
  if (store.swapWallets.has(address)) {
    return
  }
  try {
    const tokens = [baseTokenAddress, quoteTokenAddress]
    const seed = await generateSeed(address)
    const wallets = await createSwapWallets(seed, tokens, address)
    const nonRegisteredWallets: { address: string; token: string }[] = []
    const registrationChecks: Promise<void | RegistrationPayload>[] = []
    wallets.forEach(wallet => {
      registrationChecks.push(
        operator.getWalletRegistration(wallet.address, wallet.token).catch(() => {
          nonRegisteredWallets.push({ address: wallet.address, token: wallet.token })
        }),
      )
    })
    await Promise.all(registrationChecks)
    await nocust.registerBulkWallets(wallets)
    store.swapWallets.set(address, [...new Set(wallets.map(wallet => wallet.address))])
  } catch (err) {
    return Promise.reject(err)
  }
}

async function createSwapWallets(
  seed: string,
  tokens: string[],
  parentAddress: string,
): Promise<Wallet[]> {
  try {
    const wallets: Wallet[] = []
    for (let i = 0; i < SWAP_COUNT; i++) {
      const secretKey = await bip39.mnemonicToSeed(seed)
      const HDWallet = HDKey.fromMasterSeed(secretKey)
      const hdWallet = HDWallet.derivePath(`m/44'/60'/0'/0/${i}`).getWallet()
      const privateKey = hdWallet.getPrivateKeyString()
      const privateKeyBuffer = toBuffer(privateKey)
      const wallet = EthWallet.fromPrivateKey(privateKeyBuffer)
      const publicKey = wallet.getPublicKeyString()
      const address = publicToAddress(publicKey).toString('hex')
      const checkSumAddress = toChecksumAddress(address)

      tokens.forEach(token => {
        wallets.push(createWallet(checkSumAddress, token, parentAddress))
        nocust.addPrivateKey(privateKey)
      })
    }
    return wallets
  } catch (e) {
    return Promise.reject(e)
  }
}

async function generateSeed(address: string): Promise<string> {
  try {
    const signature = await blockchain.sign(address, SEED_MESSAGE)
    const seed = keccak256(signatureToRSV(signature)).toString('hex')
    return seed
  } catch (err) {
    return Promise.reject(err)
  }
}
