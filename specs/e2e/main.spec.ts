import BigNumber from 'bignumber.js'

// @ts-ignore
import './serverValidations'
import { nocust } from '../../src'
import {
  AVERAGE_GAS_PRICE, contractAddress, lqdToken, operatorAddress, operatorUrl, rpcUrl,
  // @ts-ignore
} from '../constants' // prettier-ignore
import { blockchain } from '../../src/services/blockchain'
import { APPROVE_AMOUNT } from '../../src/nocust/approveDeposits'
import { websocket, WSEventType } from '../../src/services/websocket'
import { sleep } from '../../src/helpers/utils'
import { NCEventType } from '../../src/nocust/subscribe'

const Accounts = require('web3-eth-accounts')
const web3Accounts = new Accounts('ws://localhost:8546')

describe('E2E Main', () => {
  let ted: { privateKey: string; address: string }
  let julie: { privateKey: string; address: string }

  beforeAll(async () => {
    await nocust.init({ contractAddress, operatorUrl, rpcUrl })

    nocust.addPrivateKey('0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d') // Operator

    ted = web3Accounts.create()
    nocust.addPrivateKey(ted.privateKey)

    julie = web3Accounts.create()
    nocust.addPrivateKey(julie.privateKey)
    await nocust.registerWallet(julie.address)
    await nocust.registerWallet(julie.address, lqdToken)
  })

  afterAll(() => nocust.shutdown())

  it('should be able to raise ERC20 transfer limit with approveDeposits', async () => {
    const allowance = await blockchain.callERC20Method(lqdToken, 'allowance', [
      ted.address,
      contractAddress,
    ])
    expect(allowance).toEqual('0')

    await nocust.transferParentChain({
      from: operatorAddress,
      to: ted.address,
      gasPrice: '10000000000',
      amount: '1000000000000000',
    })

    const txId = await nocust.approveDeposits({
      address: ted.address,
      token: lqdToken,
      gasPrice: AVERAGE_GAS_PRICE,
    })

    expect(typeof txId).toEqual('string')

    const allowanceAfter = await blockchain.callERC20Method(lqdToken, 'allowance', [
      ted.address,
      contractAddress,
    ])
    expect(new BigNumber(allowanceAfter).isEqualTo(APPROVE_AMOUNT)).toEqual(true)
  })

  it('should be able to register new address of ETH and LQD', async () => {
    let result = await nocust.isWalletRegistered(ted.address)
    expect(result).toEqual(false)

    await nocust.registerWallet(ted.address)

    result = await nocust.isWalletRegistered(ted.address)
    expect(result).toEqual(true)

    // LQD
    result = await nocust.isWalletRegistered(ted.address, lqdToken)
    expect(result).toEqual(false)

    await nocust.registerWallet(ted.address, lqdToken)

    result = await nocust.isWalletRegistered(ted.address, lqdToken)
    expect(result).toEqual(true)
  })

  it('should be able to register bulk addresses of ETH and LQD', async () => {
    const wallet1 = web3Accounts.create()
    const wallet2 = web3Accounts.create()
    nocust.addPrivateKey(wallet1.privateKey)
    nocust.addPrivateKey(wallet2.privateKey)

    await nocust.registerBulkWallets([
      { address: wallet1.address },
      { address: wallet2.address },
      { address: wallet2.address, token: lqdToken },
    ])

    const wallet1EthRegistered = await nocust.isWalletRegistered(wallet1.address)
    expect(wallet1EthRegistered).toEqual(true)
    const wallet1LqdRegistered = await nocust.isWalletRegistered(wallet1.address, lqdToken)
    expect(wallet1LqdRegistered).toEqual(false)
    const wallet2EthRegistered = await nocust.isWalletRegistered(wallet2.address)
    expect(wallet2EthRegistered).toEqual(true)
    const wallet2LqdRegistered = await nocust.isWalletRegistered(wallet2.address, lqdToken)
    expect(wallet2LqdRegistered).toEqual(true)
  })

  it('should be able to deposit funds', async () => {
    await nocust.transferParentChain({
      from: operatorAddress,
      to: ted.address,
      gasPrice: AVERAGE_GAS_PRICE,
      amount: '10000000000000000000',
    })
    await nocust.transferParentChain({
      from: operatorAddress,
      to: ted.address,
      token: lqdToken,
      gasPrice: AVERAGE_GAS_PRICE,
      amount: '10000000000000000000',
    })

    await nocust.deposit({
      address: ted.address,
      gasPrice: AVERAGE_GAS_PRICE,
      amount: new BigNumber('5000000000000001000'),
    })
    await nocust.deposit({
      address: ted.address,
      token: lqdToken,
      gasPrice: AVERAGE_GAS_PRICE,
      amount: new BigNumber('5000000000000001000'),
    })

    await Promise.all([
      websocket.waitForEvent({
        event: WSEventType.DEPOSIT_CONFIRMATION,
        address: ted.address,
        token: lqdToken,
        timeout: 30,
      }),
      websocket.waitForEvent({
        event: WSEventType.DEPOSIT_CONFIRMATION,
        address: ted.address,
        token: contractAddress,
        timeout: 30,
      }),
    ])

    await sleep(2000)
    const lqdBalanceCommitChain = await nocust.getBalance(ted.address, lqdToken)
    const ethBalanceCommitChain = await nocust.getBalance(ted.address, contractAddress)
    expect(lqdBalanceCommitChain.toFixed(0)).toEqual('5000000000000001000')
    expect(ethBalanceCommitChain.toFixed(0)).toEqual('5000000000000001000')
    console.log('deposits succeed')
  })

  it('should correctly transfer and then getTransfer', async () => {
    const [balanceTedEth, balanceTedLqd] = await Promise.all([
      nocust.getBalance(ted.address),
      nocust.getBalance(ted.address, lqdToken),
    ])
    const [balanceJulieEth, balanceJulieLqd] = await Promise.all([
      nocust.getBalance(julie.address),
      nocust.getBalance(julie.address, lqdToken),
    ])
    const [transferEth, transferLqd] = await Promise.all([
      nocust.transfer({
        from: ted.address,
        to: julie.address,
        amount: new BigNumber('10'),
      }),
      nocust.transfer({
        from: ted.address,
        token: lqdToken,
        to: julie.address,
        amount: new BigNumber('10'),
      }),
    ])
    console.log('transfers succeed')

    const [newBalanceTedEth, newBalanceTedLqd] = await Promise.all([
      nocust.getBalance(ted.address),
      nocust.getBalance(ted.address, lqdToken),
    ])
    const [newBalanceJulieEth, newBalanceJulieLqd] = await Promise.all([
      nocust.getBalance(julie.address),
      nocust.getBalance(julie.address, lqdToken),
    ])
    expect(balanceTedEth.minus(newBalanceTedEth).toFixed(0)).toEqual('10')
    expect(balanceTedLqd.minus(newBalanceTedLqd).toFixed(0)).toEqual('10')
    expect(newBalanceJulieEth.minus(balanceJulieEth).toFixed(0)).toEqual('10')
    expect(newBalanceJulieLqd.minus(balanceJulieLqd).toFixed(0)).toEqual('10')

    const transferLqdFetched = await nocust.getTransfer(transferLqd.id)
    const transferEthFetched = await nocust.getTransfer(transferEth.id)
    expect(transferLqdFetched.id).toEqual(transferLqd.id)
    expect(transferEthFetched.id).toEqual(transferEth.id)
  })

  // This test is inconsistent because it expects an immediate notification although it could be delayed
  it('should be able to subscribe/unsubscribe to incoming transfer', async () => {
    const callback = jest.fn()

    const unsubscribe = nocust.subscribe({
      address: julie.address,
      event: NCEventType.TRANSFER_CONFIRMATION,
      callback,
    })
    await nocust.transfer({ from: ted.address, to: julie.address, amount: new BigNumber(0) })

    unsubscribe()

    await nocust.transfer({ from: ted.address, to: julie.address, amount: new BigNumber(0) })
    await sleep(2000)
    expect(callback.mock.calls.length).toEqual(2)
  })

  it('should be able to buySLA and fetch getSLAStatus', async () => {
    const status = await nocust.getSLAStatus(ted.address)
    expect(status).toEqual(0)

    await nocust.buySLA(ted.address)

    const statusNew = await nocust.getSLAStatus(ted.address)
    expect(statusNew - Date.now() / 1000).toBeGreaterThan(29.99 * 24 * 3600)
  })

  it('should be able to fully match order, same eon and finalize it', async () => {
    const lqdBalance = await nocust.getBalance(ted.address, lqdToken)
    await nocust.setupTrading(ted.address, lqdToken, contractAddress)
    const swap1 = await nocust.addOrder({
      address: ted.address,
      amount: new BigNumber(1).shiftedBy(-5),
      price: new BigNumber(0.01),
      baseTokenAddress: lqdToken,
      quoteTokenAddress: contractAddress,
      orderType: 'BUY',
    })

    const swap2 = await nocust.addOrder({
      address: ted.address,
      amount: new BigNumber(1).shiftedBy(-5),
      price: new BigNumber(0.01),
      baseTokenAddress: lqdToken,
      quoteTokenAddress: contractAddress,
      orderType: 'SELL',
    })

    const finalizeEvent1 = websocket.waitForEvent({
      address: swap1.recipient.address,
      token: swap1.recipient.token,
      event: WSEventType.SWAP_FINALIZATION,
      timeout: 15,
    })
    const finalizeEvent2 = websocket.waitForEvent({
      address: swap2.recipient.address,
      token: swap2.recipient.token,
      event: WSEventType.SWAP_FINALIZATION,
      timeout: 15,
    })
    const harvestEvent1 = websocket.waitForEvent({
      address: ted.address,
      token: lqdToken,
      event: WSEventType.TRANSFER_CONFIRMATION,
      timeout: 20,
    })
    const harvestEvent2 = websocket.waitForEvent({
      address: ted.address,
      token: contractAddress,
      event: WSEventType.TRANSFER_CONFIRMATION,
      timeout: 20,
    })
    await Promise.all([finalizeEvent1, finalizeEvent2, harvestEvent1, harvestEvent2])
    const newLQDBalance = await nocust.getBalance(ted.address, lqdToken)

    expect(newLQDBalance.toFixed(0)).toEqual(lqdBalance.toFixed(0))
  })

  it('should be able to fully match order, different eons and finalize it', async () => {
    const lqdBalance = await nocust.getBalance(ted.address, lqdToken)
    await nocust.setupTrading(ted.address, lqdToken, contractAddress)
    const swap1 = await nocust.addOrder({
      address: ted.address,
      amount: new BigNumber(1).shiftedBy(-5),
      price: new BigNumber(0.01),
      baseTokenAddress: lqdToken,
      quoteTokenAddress: contractAddress,
      orderType: 'BUY',
    })

    console.log('Swap #1:', JSON.stringify(swap1))
    // wait for new checkpoint
    await websocket.waitForEvent({
      address: ted.address,
      token: contractAddress,
      event: WSEventType.CHECKPOINT_CREATED,
      timeout: 4 * 60,
    })
    await sleep(8000)
    const swap2 = await nocust.addOrder({
      address: ted.address,
      amount: new BigNumber(1).shiftedBy(-5),
      price: new BigNumber(0.01),
      baseTokenAddress: lqdToken,
      quoteTokenAddress: contractAddress,
      orderType: 'SELL',
    })
    console.log('Swap #2:', JSON.stringify(swap2))
    const finalizeEvent1 = websocket.waitForEvent({
      address: swap1.recipient.address,
      token: swap1.recipient.token,
      event: WSEventType.SWAP_FINALIZATION,
      timeout: 30,
    })
    const finalizeEvent2 = websocket.waitForEvent({
      address: swap2.recipient.address,
      token: swap2.recipient.token,
      event: WSEventType.SWAP_FINALIZATION,
      timeout: 30,
    })
    const harvestEvent1 = websocket.waitForEvent({
      address: ted.address,
      token: lqdToken,
      event: WSEventType.TRANSFER_CONFIRMATION,
      timeout: 30,
    })
    const harvestEvent2 = websocket.waitForEvent({
      address: ted.address,
      token: lqdToken,
      event: WSEventType.TRANSFER_CONFIRMATION,
      timeout: 30,
    })
    await Promise.all([finalizeEvent1, finalizeEvent2, harvestEvent1, harvestEvent2])
    const newLQDBalance = await nocust.getBalance(ted.address, lqdToken)

    expect(newLQDBalance.toFixed(0)).toEqual(lqdBalance.toFixed(0))
  })

  it('should be able to partially match order, same eon and cancel it', async () => {
    const lqdBalance = await nocust.getBalance(ted.address, lqdToken)
    await nocust.setupTrading(ted.address, lqdToken, contractAddress)
    const swap1 = await nocust.addOrder({
      address: ted.address,
      amount: new BigNumber(0.5).shiftedBy(-5),
      price: new BigNumber(0.01),
      baseTokenAddress: lqdToken,
      quoteTokenAddress: contractAddress,
      orderType: 'BUY',
    })
    console.log('Swap #1:', JSON.stringify(swap1))

    const swap2 = await nocust.addOrder({
      address: ted.address,
      amount: new BigNumber(1).shiftedBy(-5),
      price: new BigNumber(0.01),
      baseTokenAddress: lqdToken,
      quoteTokenAddress: contractAddress,
      orderType: 'SELL',
    })
    console.log('Swap #2:', JSON.stringify(swap2))

    const finalizeEvent = websocket.waitForEvent({
      address: swap1.recipient.address,
      token: swap1.recipient.token,
      event: WSEventType.SWAP_FINALIZATION,
      timeout: 30,
    })
    const harvestEvent = websocket.waitForEvent({
      address: ted.address,
      token: lqdToken,
      event: WSEventType.TRANSFER_CONFIRMATION,
      timeout: 30,
    })
    await Promise.all([finalizeEvent, harvestEvent])
    const updatedSwap2 = await nocust.getTransfer(swap2.id)
    expect(updatedSwap2.matchedAmounts.out.toFixed(0)).toEqual(
      new BigNumber(0.5).shiftedBy(18).toFixed(0),
    )
    const newLQDBalance = await nocust.getBalance(ted.address, lqdToken)
    expect(newLQDBalance.toFixed(0)).toEqual(
      lqdBalance.minus(new BigNumber(0.5).shiftedBy(18)).toFixed(0),
    )

    const cancellationEvent1 = websocket.waitForEvent({
      address: swap2.sender.address,
      token: swap2.sender.token,
      event: WSEventType.SWAP_CANCELLATION,
      timeout: 30,
    })
    const cancellationEvent2 = websocket.waitForEvent({
      address: swap2.recipient.address,
      token: swap2.recipient.token,
      event: WSEventType.SWAP_CANCELLATION,
      timeout: 30,
    })
    const harvestEvent1 = websocket.waitForEvent({
      address: ted.address,
      token: lqdToken,
      event: WSEventType.TRANSFER_CONFIRMATION,
      timeout: 30,
    })
    const harvestEvent2 = websocket.waitForEvent({
      address: ted.address,
      token: lqdToken,
      event: WSEventType.TRANSFER_CONFIRMATION,
      timeout: 30,
    })
    await nocust.cancelOrder(ted.address, updatedSwap2.id)
    await Promise.all([cancellationEvent1, cancellationEvent2, harvestEvent1, harvestEvent2])
  })

  it('should be successfully fetch my orders', async () => {
    await nocust.setupTrading(ted.address, lqdToken, contractAddress)
    const swap1 = await nocust.addOrder({
      address: ted.address,
      amount: new BigNumber(1).shiftedBy(-5),
      price: new BigNumber(0.025),
      baseTokenAddress: lqdToken,
      quoteTokenAddress: contractAddress,
      orderType: 'BUY',
    })
    console.log(swap1)
    let myOrders = await nocust.getMyOrders(ted.address, lqdToken, contractAddress)
    let order = myOrders.find(o => o.txId === swap1.txId)
    expect(order).toBeTruthy()
    expect(order.status).toEqual('pending')

    await nocust.cancelOrder(ted.address, order.id)
    myOrders = await nocust.getMyOrders(ted.address, lqdToken, contractAddress)
    order = myOrders.find(o => o.txId === swap1.txId)
    expect(order).toBeTruthy()
    expect(order.status).toEqual('cancelled')
  })
})
