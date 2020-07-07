import BigNumber from 'bignumber.js'

export type ConfirmWithdrawalConfig = {
  address: string
  gasPrice: BigNumber | string
  token?: string
}

export default function confirmWithdrawal(config: ConfirmWithdrawalConfig): Promise<string> {
  console.log('confirmWithdrawal', config)

  return null
}
