import Web3 from 'web3'
import { store } from '../store'

export interface BalanceMarker {
  address: string
  token: string
  eon: number
  balance: string
}

export function hashBalanceMarker(marker: BalanceMarker) {
  const { soliditySha3 } = Web3.utils
  return soliditySha3(
    { t: 'bytes32', v: soliditySha3({ type: 'address', value: store.contractAddress }) },
    { t: 'bytes32', v: soliditySha3({ type: 'address', value: marker.token }) },
    { t: 'bytes32', v: soliditySha3({ type: 'address', value: marker.address }) },
    { t: 'uint256', v: marker.eon },
    { t: 'uint256', v: marker.balance },
  ).toString()
}
