import { contracts } from '../services/contracts'

export default async function getLastSubmittedEon(): Promise<number> {
  try {
    const lastSubmittedEon = await contracts.getLastSubmissionEon()
    return lastSubmittedEon
  } catch (e) {
    return Promise.reject(e)
  }
}
