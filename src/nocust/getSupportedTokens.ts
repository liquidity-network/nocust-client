import { operator } from '../services/operator'

export interface TokenInfo {
  address: string
  name: string
  shortName: string
}

export default async function getSupportedTokens(): Promise<TokenInfo[]> {
  try {
    return await operator.getTokensList()
  } catch (e) {
    Promise.reject(e)
  }
}
