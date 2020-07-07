import { operator } from '../services/operator'
import { NCServerErrorCode } from '../helpers/errors'

export default async function getSLAStatus(address: string): Promise<number> {
  try {
    return await operator.getSLAStatus(address)
  } catch (e) {
    if (e.message === NCServerErrorCode.NOT_FOUND) return 0

    return Promise.reject(e)
  }
}
