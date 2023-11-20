import {generateKeyPairSync} from 'crypto'

class Wallet {
  #privateKey
  constructor(port, publicKey, privateKey) {
    if (publicKey && privateKey) {
      this.publicKey = getPublicKeyToHex(publicKey)
      this.#privateKey = privateKey
      return
    }
    const {privateKey: generatedPrivateKey, publicKey: generatedPublicKey} =
      generateKeyPairSync('ec', {
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
