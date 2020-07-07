import BigNumber from 'bignumber.js'

import { nocust } from '../../src'
import {
  AVERAGE_GAS_PRICE, contractAddress, lqdToken, operatorAddress, operatorUrl, rpcUrl,
  // @ts-ignore
} from '../constants' // prettier-ignore

const Accounts = require('web3-eth-accounts')
const web3Accounts = new Accounts('ws://localhost:8546')

describe('STRESS', () => {
  let ted: { privateKey: string; address: string }
  let julie: { privateKey: string; address: string }

  beforeAll(async () => {
    await nocust.init({ contractAddress, operatorUrl, rpcUrl })

    nocust.addPrivateKey('0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d') // Operator

    ted = web3Accounts.create()
    nocust.addPrivateKey(ted.privateKey)

    julie = web3Accounts.create()
    nocust.addPrivateKey(julie.privateKey)
    await Promise.all([
      nocust.registerWallet(julie.address),
      nocust.registerWallet(julie.address, lqdToken),
      nocust.registerWallet(ted.address),
      nocust.registerWallet(ted.address, lqdToken),
    ])

    // await nocust.transferParentChain({
    //   from: operatorAddress,
    //   to: ted.address,
    //   gasPrice: '10000000000',
    //   amount: '1000000000000000',
    // })
    //
    // await nocust.deposit({
    //   address: ted.address,
    //   gasPrice: AVERAGE_GAS_PRICE,
    //   amount: new BigNumber('1000000000000001000'),
    // })
    //
    // await websocket.waitForEvent({
    //   event: WSEventType.DEPOSIT_CONFIRMATION,
    //   address: ted.address,
    //   token: contractAddress,
    //   timeout: 30,
    // })
  })

  afterAll(() => nocust.shutdown())

  it('should be able to render many sequential transfers(lqd + eth simultaneously)', async () => {
    const doTransfers = async (lqd: boolean = false) => {
      let i
      for (i = 0; i < 500; i++) {
        console.log('transfer' + (lqd ? ' lqd' : ''), i)
        await nocust.transfer({
          from: ted.address,
          token: lqd ? lqdToken : undefined,
          to: julie.address,
          amount: new BigNumber('0'),
        })
      }
    }

    await Promise.all([
      doTransfers(),
      doTransfers(true),
    ])

    await nocust.getBalance(ted.address)
    await nocust.getBalance(ted.address, lqdToken)
  })
})
