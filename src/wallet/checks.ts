import { BigNumber } from 'bignumber.js'

import { RegistrationPayload } from '../services/operator/payloads'
import { hashActiveState } from './activeState'
import { blockchain } from '../services/blockchain'
import { store } from '../store'
import { EMPTY_HASH } from '../constants'

export const checkRegistration = (
  address: string,
  token: string,
  registration: RegistrationPayload,
) => {
  const clientRegistrationHash = hashActiveState({
    token,
    address,
    eon: registration.eon,
    trailIdentifier: 0,
    transactionSetHash: EMPTY_HASH,
    spent: new BigNumber(0),
    gained: new BigNumber(0),
  })

  const isClientRegistrationValid = blockchain.validateSignature(
    clientRegistrationHash,
    registration.walletSignature,
    address,
  )
  if (!isClientRegistrationValid) return false

  const operatorRegistrationHash = hashActiveState({
    address,
    token,
    eon: registration.eon,
    trailIdentifier: registration.trailIdentifier,
    transactionSetHash: EMPTY_HASH,
    spent: new BigNumber(0),
    gained: new BigNumber(0),
  })
  const isOperatorRegistrationValid = blockchain.validateSignature(
    operatorRegistrationHash,
    registration.operatorSignature,
    store.contractOwner,
  )
  if (!isOperatorRegistrationValid) return false

  return true
}
