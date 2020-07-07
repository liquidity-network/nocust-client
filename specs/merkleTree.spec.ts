import { constructMerkleTree } from '../src/wallet/merkleTree'
import { EMPTY_HASH } from '../src/constants'

describe('Merkle Trees', () => {
  it('constructing MT of 0 leaves is correct', () => {
    expect(constructMerkleTree([])).toEqual({ height: 0, hash: EMPTY_HASH })
  })

  it('constructing MT of 1 leaf is correct', () => {
    expect(
      constructMerkleTree([
        { height: 0, hash: '0x3d608e17754e8192146ece6115e226422045dffb81885c6f3174eb18801a0ed0' },
      ]),
    ).toEqual({
      height: 0,
      hash: '0x3d608e17754e8192146ece6115e226422045dffb81885c6f3174eb18801a0ed0',
    })
  })

  it('constructing MT of 2 leaves is correct', () => {
    const tree = constructMerkleTree([
      { height: 0, hash: '0x3d608e17754e8192146ece6115e226422045dffb81885c6f3174eb18801a0ed0' },
      { height: 0, hash: '0x562963eff520203e8aff7ce811cd7b1aa85bc3034a2a95cf61f8671be3a86c89' },
    ])
    expect(tree.hash).toEqual('0x83526a0545a78e43506a6f456649f2468c7b13a7c051cb3a867324c99e5b5f84')
    expect(tree.height).toEqual(1)
  })

  it('constructing MT of 3 leaves is correct', () => {
    const tree = constructMerkleTree([
      { height: 0, hash: '0x3d608e17754e8192146ece6115e226422045dffb81885c6f3174eb18801a0ed0' },
      { height: 0, hash: '0x562963eff520203e8aff7ce811cd7b1aa85bc3034a2a95cf61f8671be3a86c89' },
      { height: 0, hash: '0x83526a0545a78e43506a6f456649f2468c7b13a7c051cb3a867324c99e5b5f84' },
    ])
    expect(tree.leftChild.height).toEqual(1)
    expect(tree.rightChild.height).toEqual(1)
    expect(tree.hash).toEqual('0x178eb0d4245b3befea03dae66f809d007c0e94bdb6a77d2c529d3c47d360774f')
    expect(tree.height).toEqual(2)
  })

  it('constructing MT of 5 leaves is correct', () => {
    const tree = constructMerkleTree([
      { height: 0, hash: '0x3d608e17754e8192146ece6115e226422045dffb81885c6f3174eb18801a0ed0' },
      { height: 0, hash: '0x562963eff520203e8aff7ce811cd7b1aa85bc3034a2a95cf61f8671be3a86c89' },
      { height: 0, hash: '0x83526a0545a78e43506a6f456649f2468c7b13a7c051cb3a867324c99e5b5f84' },
      { height: 0, hash: '0x178eb0d4245b3befea03dae66f809d007c0e94bdb6a77d2c529d3c47d360774f' },
      { height: 0, hash: '0x83526a0545a78e43506a6f456649f2468c7b13a7c051cb3a867324c99e5b5f84' },
    ])
    expect(tree.leftChild.height).toEqual(2)
    expect(tree.rightChild.height).toEqual(2)
    expect(tree.hash).toEqual('0xbcec2eb23e5d6c85db9ea4ffff4371ffb94cff0a872d6a02be70918f49c28534')
    expect(tree.height).toEqual(3)
  })
})
