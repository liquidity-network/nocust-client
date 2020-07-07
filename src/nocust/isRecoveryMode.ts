import { contracts } from '../services/contracts'

export default async function isRecoveryMode(): Promise<boolean> {
  try {
    const isMissedCheckpointSubmission = await contracts.checkMissedCheckpointSubmission()
    return isMissedCheckpointSubmission
  } catch (e) {
    return Promise.reject(e)
  }
}
