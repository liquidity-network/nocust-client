import { nocust } from '../src/nocust'
// @ts-ignore
import { contractAddress, operatorUrl, rpcUrl } from './constants'

describe('nocust', () => {
  it('throws error on invalid contract address', () => {
    expect(
      nocust.init({
        contractAddress: '0x9Z61C133DD8580860B6b7E504bC5Aa500f0f06a7',
        operatorUrl,
        rpcUrl,
      }),
    ).rejects.toThrowError()
  })

  it('throws error on empty/null operator url', () => {
    expect(nocust.init({ contractAddress, operatorUrl: '', rpcUrl })).rejects.toThrowError()

    expect(nocust.init({ contractAddress, operatorUrl: null, rpcUrl })).rejects.toThrowError()
  })

  it('throws error on empty/null rpc url', () => {
    expect(nocust.init({ contractAddress, operatorUrl, rpcUrl: '' })).rejects.toThrowError()

    expect(nocust.init({ contractAddress, operatorUrl, rpcUrl: undefined })).rejects.toThrowError()
  })

  it('correctly calculates getWithdrawalFee', () => {
    const feeLowGasPrice = nocust.getWithdrawalFee('4000000000')
    expect(feeLowGasPrice.toFixed(0)).toEqual('500500000000000')

    const fee = nocust.getWithdrawalFee('10000000000')
    expect(fee.toFixed(0)).toEqual('1001000000000000')
  })
})
