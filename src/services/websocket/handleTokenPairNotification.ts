type HandleTokenPairNotificationConfig = {
  address: string
  token1: string
  token2: string
  type: string
  data: any
}
export async function handleTokenPairNotification(config: HandleTokenPairNotificationConfig) {
  console.log('handleTokenPairNotification', config)
}
