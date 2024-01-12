import {generateKeyPairSync} from 'crypto'
import {generateKeyPair, encryptAndSave, readAndDecrypt} from './utils.js'
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

  saveToFile(filePath, password) {
    const data = {
      publicKey: this.publicKey,
      privateKey: this.getPrivateKey(),
    }
    encryptAndSave(data, password, filePath)
  }

  static loadFromFile(filePath, password) {
    try {
      const data = readAndDecrypt(filePath, password)
      return new Wallet(null, data.publicKey, data.privateKey)
    } catch (e) {
      console.log('Error: Invalid password or file path')
      return
    }
  }
}

export default Wallet

const getPublicKeyToHex = publicKey => {
  return publicKey.toString('hex')
}
