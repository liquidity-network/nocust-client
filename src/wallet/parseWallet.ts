import BigNumber from 'bignumber.js'
import JSONBigInt from 'json-bigint'

import { Eon } from './eon'
import { createWallet, Wallet } from '.'

export function parseWallet(data: string): Wallet {
  // console.log('parse wallet string', data)

  const w: Wallet = JSONBigInt.parse(data)

  // console.log('parse wallet data', w)

  const wallet = createWallet(w.address, w.token)

  wallet.isRegistered = w.isRegistered
  wallet.registrationEon = w.registrationEon
  wallet.registrationSignature = w.registrationSignature
  wallet.trailIdentifier = w.trailIdentifier

  if (w.currentEon) {
    wallet.currentEon = new Eon(wallet, w.currentEon.eon)

    if (w.currentEon.accountProof) {
      wallet.currentEon.accountProof = {
        ...w.currentEon.accountProof,
        left: new BigNumber(w.currentEon.accountProof.left),
        right: new BigNumber(w.currentEon.accountProof.right),
        pathValues: w.currentEon.accountProof.pathValues.map((v: any) => new BigNumber(v)),
      }
    }
    wallet.currentEon.deposits = w.currentEon.deposits.map((d: any) => ({
      ...d,
      amount: new BigNumber(d.amount),
    }))
    wallet.currentEon.transactions = w.currentEon.transactions.map((t: any) => ({
      ...t,
      amount: new BigNumber(t.amount),
      passiveMarker: new BigNumber(t.passiveMarker),
      nonce: new BigNumber(t.nonce),
    }))
  }

  // log('==> output wallet', wallet)

  return wallet
}
