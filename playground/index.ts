import '../src/helpers/helperTypes'
import { nocust } from '../src/nocust'
import BigNumber from 'bignumber.js'
// @ts-ignore
import { getOperatorConfig } from './operatorConfigs'
// @ts-ignore
import { ACCOUNTS_POOL, lqdToken } from '../specs/constants'
// @ts-ignore
import { fsStorage } from './fsStorage'
import { websocket, WSEventType } from '../src/services/websocket'
import { NCEventType } from '../src/nocust/subscribe'

const {
  AVERAGE_GAS_PRICE, contractAddress, lqdContractAddress, operatorUrl, rpcUrl,
  operatorAddress, operatorPrivateKey,
} = getOperatorConfig('local') // prettier-ignore

run().then(() => process.exit(0))

async function run() {
  await fsStorage.init()

  await nocust.init({ contractAddress, operatorUrl, rpcUrl, storageEngine: fsStorage })

  console.log('current eon', await nocust.getEon())

  const alice = ACCOUNTS_POOL[0]
  // const alice = web3.eth.accounts.create()
  const bob = ACCOUNTS_POOL[1]
  // const bob = web3.eth.accounts.create()

  nocust.addPrivateKey(operatorPrivateKey)
  nocust.addPrivateKey(alice.privateKey)
  nocust.addPrivateKey(bob.privateKey)

  try {
    const isAliceRegistered = await nocust.isWalletRegistered(alice.address)
    if (!isAliceRegistered) await nocust.registerWallet(alice.address)

    const isBobRegistered = await nocust.isWalletRegistered(bob.address)
    if (!isBobRegistered) await nocust.registerWallet(bob.address)

    const aliceBalance = await nocust.getParentChainBalance(alice.address)

    if (aliceBalance.isLessThan('100')) {
      console.log('Sending ETH')
      await nocust.transferParentChain({
        from: operatorAddress,
        to: alice.address,
        gasPrice: AVERAGE_GAS_PRICE,
        amount: '20000000000000000000',
      })

      await nocust.transferParentChain({
        from: operatorAddress,
        to: alice.address,
        token: lqdToken,
        gasPrice: AVERAGE_GAS_PRICE,
        amount: '10000',
      })

      console.log('Depositing ETH')
      await nocust.deposit({
        address: alice.address,
        token: contractAddress,
        amount: new BigNumber(1000),
        gasPrice: AVERAGE_GAS_PRICE,
      })

      await websocket.waitForEvent({
        address: alice.address,
        token: contractAddress,
        event: WSEventType.DEPOSIT_CONFIRMATION,
        timeout: 30,
      })
    }

    const limit = await nocust.getWithdrawalLimit(alice.address)
    console.log('withdrawal limit', limit.toFixed())

    // if (limit.isLessThan(10)) {
    //   await websocket.waitForEvent({
    //     address: alice.address,
    //     token: contractAddress,
    //     event: WSEventType.CHECKPOINT_CREATED,
    //     timeout: 130,
    //   })
    //
    //   console.log('eon', await nocust.getEon())
    //   console.log('withdrawal limit', (await nocust.getWithdrawalLimit(alice.address)).toFixed())
    //
    //   await websocket.waitForEvent({
    //     address: alice.address,
    //     token: contractAddress,
    //     event: WSEventType.CHECKPOINT_CREATED,
    //     timeout: 130,
    //   })
    //
    //   console.log('eon', await nocust.getEon())
    //   console.log('withdrawal limit', (await nocust.getWithdrawalLimit(alice.address)).toFixed())
    // }

    // await nocust.withdraw({
    //   address: alice.address,
    //   amount: new BigNumber('10'),
    //   gasPrice: AVERAGE_GAS_PRICE,
    // })

    await nocust.transfer({ from: alice.address, to: bob.address, amount: new BigNumber(1) })

    // unsubscribe()
    //
    // await nocust.transfer({ from: alice.address, to: bob.address, amount: new BigNumber(1) })

    console.log('alice balance', (await nocust.getBalance(alice.address)).toFixed())
    console.log('bob balance', (await nocust.getBalance(bob.address)).toFixed())

    // const wallet = await nocust.getWallet(alice.address)
    // console.log('wallet', wallet)

    await nocust.shutdown()
  } catch (e) {
    console.log(e)
  }
}
