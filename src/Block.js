import {createHash} from 'crypto'

const SHA256 = message => createHash('sha256').update(message).digest('hex')

export default class Block {
  constructor(timestamp = '', transactions = [], prevHash = '', nonce = 0) {
    this.timestamp = timestamp
    this.transactions = transactions
    this.hash = this.getHash()
    this.prevHash = prevHash
    this.nonce = nonce
  }

  hasValidTransactions(chain) {
    return this.transactions.every(transaction =>
      transaction.isValid(transaction, chain),
    )
  }

  getHash() {
    return SHA256(
      JSON.stringify(this.transactions) +
        this.nonce +
        this.prevHash +
        this.timestamp,
    )
  }

  // Bitcoin style mining
  mine(difficulty) {
    console.log('⛏️mining...')
    while (!this.hash.startsWith(new Array(difficulty + 1).fill(0).join(''))) {
      this.nonce++
      this.hash = this.getHash()
    }
    console.log('✅mining completed')
  }

  toString() {
    return JSON.stringify(this, null, 2)
  }
}
