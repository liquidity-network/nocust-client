import BigNumber from 'bignumber.js'

// @ts-ignore
import './serverValidations'
import { nocust } from '../../src'
import {
  BLOCKS_PER_EON, contractAddress, lqdToken, operatorAddress, operatorUrl, rpcUrl,
  // @ts-ignore
} from '../constants' // prettier-ignore

describe('E2E Basic', () => {
  beforeAll(async () => {
    await nocust.init({ contractAddress, operatorUrl, rpcUrl })

    nocust.addPrivateKey('0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d') // Operator
  })

  afterAll(() => nocust.shutdown())

  it('should be able to fetch getBlocksPerEon', async () => {
    const blocks = await nocust.getBlocksPerEon()
    expect(blocks).toEqual(BLOCKS_PER_EON)
  })

  it('should be able to fetch getEon', async () => {
    const eon = await nocust.getEon()
    expect(eon).toBeGreaterThan(0)
  })

  it('should be able to fetch getEra', async () => {
    const era = await nocust.getEra()
    expect(era).toBeGreaterThanOrEqual(0)
  })

  it('should be able to correctly fetch getSupportedTokens', async () => {
    const tokens = await nocust.getSupportedTokens()
    expect(tokens).toEqual([
      { address: contractAddress, name: 'Ethereum', shortName: 'ETH' },
      { address: lqdToken, name: 'LQD', shortName: 'LQD' },
    ])
  })

  it('should be able to fetch SLA info', async () => {
    const info = await nocust.getSLAInfo()
    expect(info).toEqual({
      token: '0xe982E462b094850F12AF94d21D470e21bE9D0E9C',
      price: new BigNumber('1000000000000000000'),
      recipient: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      monthlyLimit: 100,
    })
  })

  it('should be able to fetch ETH getParentChainBalance of operator address', async () => {
    const balance = await nocust.getParentChainBalance(operatorAddress)
    const balance2 = await nocust.getParentChainBalance(operatorAddress, contractAddress)
    expect(balance.isGreaterThan('1000000000000000')).toEqual(true)
    expect(balance.isEqualTo(balance2)).toEqual(true)
  })

  it('should be able to fetch LQD getOnChainBalance of operator address', async () => {
    const balance = await nocust.getParentChainBalance(operatorAddress, lqdToken)
    expect(balance.isGreaterThan('1000000000000000')).toEqual(true)
  })

  it('should be able to check isRecoveryMode', async () => {
    const isRecoveryMode = await nocust.isRecoveryMode()
    expect(isRecoveryMode).toEqual(false)
  })
})
