import { remove0x } from '../helpers/utils'

export interface Signature {
  address: string
  hash: string
  r: string
  s: string
  v: string
}

export function createSignature(address: string, hash: string, signature: string): Signature {
  signature = remove0x(signature)

  let v = parseInt(signature.slice(128, 130), 16)
  if (v < 27) v += 27

  return {
    address,
    hash,
    r: signature.slice(0, 64),
    s: signature.slice(64, 128),
    v: v.toString(16),
  }
}

export const signatureToRSV = ({ r, s, v }: Signature) => r + s + v
