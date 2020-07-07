import Web3 from 'web3'

import { EMPTY_HASH } from '../constants'

export interface MerkleTree {
  hash: string
  parent?: MerkleTree
  leftChild?: MerkleTree
  rightChild?: MerkleTree
  height: number
}

export interface MerkleProof {
  root: string
  path: string[]
  trailIdentifier: number
  leafChecksum: string
}

const constructMerkleLeaf = (leaves: MerkleTree[]): MerkleTree => {
  if (leaves.length === 0) {
    return { height: 0, hash: EMPTY_HASH }
  } else if (leaves.length === 1) {
    return { height: 0, hash: leaves[0].hash }
  }
  const left = leaves.slice(0, leaves.length / 2)
  const right = leaves.slice(leaves.length / 2, leaves.length)

  const leftChild = constructMerkleTree(left)
  const rightChild = constructMerkleTree(right)

  const height = leftChild.height + 1

  const hash = Web3.utils.soliditySha3(
    { t: 'uint32', v: leftChild.height },
    { t: 'bytes32', v: leftChild.hash },
    { t: 'bytes32', v: rightChild.hash },
  )

  const result = { leftChild, rightChild, height, hash }

  leftChild.parent = result
  rightChild.parent = result

  return result
}

export const constructMerkleTree = (leaves: MerkleTree[]): MerkleTree => {
  if (leaves.length > 2) {
    let paddedLength = 2

    while (paddedLength < leaves.length) paddedLength *= 2

    while (leaves.length < paddedLength) leaves.push({ height: 0, hash: EMPTY_HASH })
  }

  return constructMerkleLeaf(leaves)
}

export const EMPTY_MERKLE_TREE = constructMerkleTree([])
