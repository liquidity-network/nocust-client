export const BLOCKS_PER_EON = parseInt(process.env.BLOCKS_PER_EON) || 60
export const AVERAGE_GAS_PRICE = '100000000'
export const contractAddress = '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7'
export const lqdToken = '0xe982E462b094850F12AF94d21D470e21bE9D0E9C'
export const operatorAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
export const operatorUrl = process.env.TEST_HUB_URL || 'http://localhost:8123/'
export const rpcUrl = process.env.RPC_URL || 'http://localhost:8545/'

// Have no funds
export const ACCOUNTS_POOL: Array<{ address: string; privateKey: string }> = [
  {
    address: '0xbE792bd9AD3e65cB32f883a6Ec46538DFD905434',
    privateKey: '0x31cd0db8b9f4f571eb08064db0a04de132d6b0543451e9c0d6414e38939917df',
  },
  {
    address: '0x4cc5283d1b2F5D5A3423132E0182945eAE557654',
    privateKey: '0xcd616a6029259dff24d4cfe3de579e14d4895eca70b2a0cd02ce800c2e74614b',
  },
]
