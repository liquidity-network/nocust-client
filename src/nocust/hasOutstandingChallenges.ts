import { contracts } from '../services/contracts'

export default async function hasOutstandingChallenges(): Promise<boolean> {
  try {
    const hasOutstandingChallenges = await contracts.checkOutstandingChallenges()
    return hasOutstandingChallenges
  } catch (e) {
    return Promise.reject(e)
  }
}
