interface OperatorConfig {
  AVERAGE_GAS_PRICE: string
  contractAddress: string
  lqdContractAddress: string
  operatorAddress: string
  operatorPrivateKey: string
  operatorUrl: string
  rpcUrl: string
}

const data = {
  local: {
    AVERAGE_GAS_PRICE: '100000000',
    contractAddress: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
    lqdContractAddress: '0xe982E462b094850F12AF94d21D470e21bE9D0E9C',
    operatorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    operatorPrivateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
    operatorUrl: 'http://localhost:8123/',
    rpcUrl: 'http://localhost:8545/',
  },
  limbo: {
    AVERAGE_GAS_PRICE: '100000000',
    contractAddress: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
    lqdContractAddress: '0xe982E462b094850F12AF94d21D470e21bE9D0E9C',
    operatorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    operatorPrivateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
    operatorUrl: 'https://limbo.liquidity.network/',
    rpcUrl: 'https://limbo.liquidity.network/ethrpc',
  },
  rinkeby: {
    AVERAGE_GAS_PRICE: '100000000',
    contractAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
    lqdContractAddress: '0xA9F86DD014C001Acd72d5b25831f94FaCfb48717',
    operatorAddress: '',
    operatorPrivateKey: '',
    operatorUrl: 'https://rinkeby.liquidity.network/',
    rpcUrl: 'https://rinkeby.liquidity.network/ethrpc',
  },
}

export function getOperatorConfig(operator: 'local' | 'limbo' | 'rinkeby'): OperatorConfig {
  return data[operator]
}
