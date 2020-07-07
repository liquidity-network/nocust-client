import { operator } from '../services/operator'
import { blockchain } from '../services/blockchain'
import { websocket } from '../services/websocket'
import { remove0x } from '../helpers/utils'
import { TokenInfo } from './getSupportedTokens'

export default async function addPrivateKey(privateKey: string): Promise<string> {
  const address = blockchain.addPrivateKey(privateKey)

  // TODO Currently it's hacked by hardcoded!!!
  //  Change store.contractAddress to '*' so it's subscribed on all tokens of address
  // TODO: Tokens Should be fetched from the endpoint.
  // streams: [
  //   // ETH
  //   `wallet/${remove0x('0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7')}/${remove0x(address)}`,
  //   // LQD
  //   `wallet/${remove0x('0xe982E462b094850F12AF94d21D470e21bE9D0E9C')}/${remove0x(address)}`,
  // ]

  try {
    const tokens = await operator.getTokensList()
    const tokenStream = await Promise.all(
      tokens.map((token: TokenInfo) => `wallet/${remove0x(token.address)}/${remove0x(address)}`),
    )
    websocket.send('subscribe', {
      streams: tokenStream,
    })
    return Promise.resolve('Private key added')
  } catch (e) {
    Promise.reject(e)
  }
}
