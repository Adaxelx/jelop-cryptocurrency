import {generateKeyPairSync} from 'crypto'
import {generateKeyPair} from './utils.js'
class Wallet {
  #privateKey
  constructor(port, publicKey, privateKey) {
    if (publicKey && privateKey) {
      this.publicKey = getPublicKeyToHex(publicKey)
      this.#privateKey = privateKey
      return
    }
    const {privateKey: generatedPrivateKey, publicKey: generatedPublicKey} =
      generateKeyPair()
    this.publicKey = getPublicKeyToHex(generatedPublicKey)
    this.#privateKey = generatedPrivateKey

    console.log('Wallet created')
    this.show()
  }

  getPrivateKey() {
    return this.#privateKey
  }

  show() {
    console.table({
      'Public key': {value: this.publicKey},
      'Private key': {value: this.#privateKey},
    })
  }
}

export default Wallet

const getPublicKeyToHex = publicKey => {
  return publicKey.toString('hex')
}
