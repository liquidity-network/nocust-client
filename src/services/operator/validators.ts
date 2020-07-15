export type PayloadValidators = {
  isValidating: boolean
  validateDeposit: (data: any) => void
  validateSLA: (data: any) => void
  validateSLAInfo: (data: any) => void
  validateTransaction: (data: any) => void
  validateTokensList: (data: any) => void
  validateWalletRegistration: (data: any) => void
  validateWalletState: (data: any) => void
  validateSwapFreeze: (data: any) => void
  validateSwapFinalization: (data: any) => void
  validateSwapCancellation: (data: any) => void
  validateOrderBook: (data: any) => void
}

// We don't want to validate payloads on production, should be mocked in tests
export const payloadValidators: PayloadValidators = { isValidating: false } as any
