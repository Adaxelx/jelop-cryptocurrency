import {createHash} from 'crypto'

const SHA256 = message => createHash('sha256').update(message).digest('hex')

export default class Block {
  constructor(timestamp = '', data = []) {
    this.timestamp = timestamp
    this.data = data
    this.hash = this.getHash()
    this.prevHash = ''
    this.nonce = 0
  }

  getHash() {
    return SHA256(
      this.prevHash + this.timestamp + JSON.stringify(this.data) + this.nonce,
    )
  }

  mine(difficulty) {
    console.log('⛏️mining...')
    while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
      this.nonce++

      this.hash = this.getHash()
    }
    console.log('✅mining completed')
  }

  toString() {
    return JSON.stringify(this, null, 2)
  }
}
