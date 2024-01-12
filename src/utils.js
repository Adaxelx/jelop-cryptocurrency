import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  generateKeyPairSync,
} from 'crypto'
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

import fs from 'fs'

export function encryptAndSave(data, password, filePath) {
  const key = scryptSync(password, 'salt', 24) // Derive key from password
  const iv = randomBytes(16) // Initialization vector
  const cipher = createCipheriv('aes-192-cbc', key, iv)
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const fileData = {iv: iv.toString('hex'), content: encrypted}
  fs.writeFileSync(filePath, JSON.stringify(fileData))
  console.log('Wallet data saved and encrypted')
}

export function readAndDecrypt(filePath, password) {
  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const key = scryptSync(password, 'salt', 24)
  const decipher = createDecipheriv(
    'aes-192-cbc',
    key,
    Buffer.from(fileData.iv, 'hex'),
  )

  let decrypted = decipher.update(fileData.content, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
}
