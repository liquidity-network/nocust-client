import BigNumber from 'bignumber.js'
import { Signature } from './wallet/signature'

export const EMPTY_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const IS_NODEJS = typeof module === 'object' && typeof module.exports === 'object'

export const BN_2_256_MINUS_1 = new BigNumber(2).pow(256).minus(1)

export const BN_ZERO = new BigNumber(0)

export const SWAP_COUNT = 5

// WARNING!: Changing this message during production may result in users losing their
// swap wallets and the funds included in them
export const SEED_MESSAGE = 'LIQUIDITY NETWORK'

export const CHALLENGE_GAS = new BigNumber(1).shiftedBy(5)

export const EMPTY_SIGNATURE: Signature = {
  address: '0x0000000000000000000000000000000000000000',
  hash: EMPTY_HASH,
  r: EMPTY_HASH,
  s: EMPTY_HASH,
  v: '00',
}
