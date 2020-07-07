// import Web3 from 'web3'
//
// import { EMPTY_HASH } from '../constants'
import BigNumber from 'bignumber.js'

export interface IntervalTree {
  hash: string
  parent?: IntervalTree
  left: BigNumber
  right: BigNumber
  leftChild?: IntervalTree
  rightChild?: IntervalTree
  innerNode: string
  height: number
}

export interface IntervalProof {
  root: string
  path: string[]
  pathValues: BigNumber[]
  left: BigNumber
  right: BigNumber
  trailIdentifier: number
  leafChecksum: string
  totalAllotment: BigNumber
}

// const constructIntervalLeaf = (leaves: IntervalTree[]): IntervalTree => {
//   return null
// }

// export const EMPTY_INTERVAL_TREE = constructMerkleTree([])
