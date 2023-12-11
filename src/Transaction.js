import {getPublicKeyToHex} from './utils.js'
import crypto, {
  createHash,
  createSign,
  createVerify,
  createSecretKey,
  createPublicKey,
} from 'crypto'

export default class Transaction {
  constructor(from, to, amount) {
    this.from = from
    this.to = to
    this.amount = amount
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

  isValid(tx, chain) {
    return (
      tx.from &&
      tx.to &&
      tx.amount &&
      (chain.getBalance(tx.from) >= tx.amount ||
        tx.from === getPublicKeyToHex(chain.coinbaseKeyPair.publicKey))
    )
  }

  toString() {
    return JSON.stringify(this, null, 2)
  }
}
