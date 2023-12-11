import {getPublicKeyToHex} from './utils.js'
import crypto, {
  createHash,
  createSign,
  createVerify,
  createSecretKey,
  createPublicKey,
} from 'crypto'

export default class Transaction {
  constructor(from, to, amount, signature) {
    this.from = from
    this.to = to
    this.amount = amount
    this.signature = signature
  }

  sign(keyPair) {
    // Check if the public key matches the "from" address of the transaction
    if (getPublicKeyToHex(keyPair.publicKey) === this.from) {
      // Sign the transaction
      const sign = createSign('SHA256')
      sign.write(this.from + this.to + this.amount)
      sign.end()
      const signature = sign.sign(keyPair.privateKey, 'hex')
      this.signature = signature
    }
  }

  verify(tx) {
    const verify = createVerify('SHA256')
    verify.write(tx.from + tx.to + tx.amount)
    verify.end()

    if (
      verify.verify(
        createPublicKey({
          key: Buffer.from(tx.from, 'hex'),
          format: 'der', // Use DER encoding for elliptic curve keys
          type: 'spki',
          namedCurve: 'sect239k1',
        }),
        tx.signature,
        'hex',
      )
    ) {
      console.log('Verify success Transaction')
      return true
    } else {
      console.log('Verify failure  Transaction')
      return false
    }
  }

  isValid(tx, chain) {
    return (
      tx.from &&
      tx.to &&
      tx.amount &&
      (chain.getBalance(tx.from) >= tx.amount ||
        tx.from === getPublicKeyToHex(chain.coinbaseKeyPair.publicKey)) &&
      this.verify(tx)
    )
  }

  toString() {
    return JSON.stringify(this, null, 2)
  }
}
