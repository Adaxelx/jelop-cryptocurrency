const crypto = require('crypto'),
  SHA256 = message => crypto.createHash('sha256').update(message).digest('hex')

export default class Block {
  constructor(timestamp = '', data = []) {
    this.timestamp = timestamp
    this.data = data
    this.hash = this.getHash()
    this.prevHash = '' // previous block's hash
  }

  // Our hash function.
  getHash() {
    return SHA256(this.prevHash + this.timestamp + JSON.stringify(this.data))
  }

  mine(difficulty) {
    // Basically, it loops until our hash starts with
    // the string 0...000 with length of <difficulty>.
    while (!this.hash.startsWith(Array(difficulty + 1).join('0'))) {
      // We increases our nonce so that we can get a whole different hash.
      this.nonce++
      // Update our new hash with the new nonce value.
      this.hash = this.getHash()
    }
  }
}
