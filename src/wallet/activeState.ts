import BigNumber from 'bignumber.js'
import Web3 from 'web3'

import { store } from '../store'
import { Signature } from './signature'
import { BN_ZERO, EMPTY_HASH } from '../constants'

export interface ActiveState {
  address: string
  token: string
  eon: number
  trailIdentifier: number
  transactionSetHash: string
  spent: BigNumber
  gained: BigNumber
  operatorSignature?: Signature
  walletSignature?: Signature
}

// added checkSpentAndGained boolean checker because this function is called at registerWallet and transfers and other important functions and they are all depend on it as its, and since its changed to check for spent and gained if they are 0 so we return empty hash so it would work with withdrawalRequest and state update challenge which require same active state check sum like the server and tx_set_root so basically we add this flag whether we want to bypass spent/gained checker or not.

export function hashActiveState(state: ActiveState, checkSpentAndGained: boolean = false): string {
  const { soliditySha3 } = Web3.utils
  if (checkSpentAndGained) {
    if (state.spent === BN_ZERO && state.gained === BN_ZERO) {
      return EMPTY_HASH
    }
  }
  return soliditySha3(
    { t: 'bytes32', v: soliditySha3({ t: 'address', v: store.contractAddress }) },
    { t: 'bytes32', v: soliditySha3({ t: 'address', v: state.token }) },
    { t: 'bytes32', v: soliditySha3({ t: 'address', v: state.address }) },
    { t: 'uint64', v: state.trailIdentifier },
    { t: 'uint256', v: state.eon },
    { t: 'bytes32', v: state.transactionSetHash },
    { t: 'uint256', v: state.spent.toFixed(0) },
    { t: 'uint256', v: state.gained.toFixed(0) },
  )
}
