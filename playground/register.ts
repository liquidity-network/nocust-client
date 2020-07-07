import { web3 } from '../src/services/blockchain'
import { nocust } from '../src/nocust'

const register = async () => {
  const alice = web3.eth.accounts.create()
  nocust.addPrivateKey(alice.privateKey)

  await nocust.registerWallet(alice.address)
}

export async function registerMulti() {
  for (let i = 0; i < 100; i++) {
    await register()
  }
}
