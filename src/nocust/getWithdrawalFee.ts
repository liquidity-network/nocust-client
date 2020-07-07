import BigNumber from 'bignumber.js'

const SLASH_GAS_COST = new BigNumber(100100)
const CHALLENGE_COST = new BigNumber(5000000000)
export default function getWithdrawalFee(gasPrice: BigNumber | string): BigNumber {
  return BigNumber.maximum(SLASH_GAS_COST.times(CHALLENGE_COST), SLASH_GAS_COST.times(gasPrice))
}
