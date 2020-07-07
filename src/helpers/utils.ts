import BigNumber from 'bignumber.js'

export const remove0x = (address: string): string =>
  address.indexOf('0x') === 0 ? address.substring(2) : address

export const defineWalletKey = (address: string, token: string) => `${token}/${address}`

export const failOnTimeout = (timeoutSeconds: number) =>
  new Promise((resolve, reject) => setTimeout(reject, timeoutSeconds * 1000))

export const isSameHexValue = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export const generateRandomNonce = () =>
  new BigNumber(Math.floor(100000000 + Math.random() * 899999999))

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export function detectEnvironment(): string {
  if (typeof document !== 'undefined') {
    return 'browser'
  } else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'react-native'
  } else {
    return 'node'
  }
}
