import {generateKeyPairSync} from 'crypto'
import Transaction from './Transaction.js'

export function getPublicKeyToHex(publicKey) {
  return publicKey.toString('hex')
}

export function generateKeyPair() {
  return generateKeyPairSync('ec', {
    namedCurve: 'sect239k1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'der',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })
}
