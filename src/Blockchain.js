import Block from './Block.js'

export default class Blockchain {
  constructor(difficulty = 6, chain = [new Block(Date.now().toString())]) {
    this.chain = chain
    this.difficulty = difficulty
    console.log(this.toString())
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(block) {
    block.prevHash = this.getLastBlock().hash
    block.hash = block.getHash()
    block.mine(this.difficulty)

    this.chain.push(Object.freeze(block))
    console.log(this.toString())
  }

  // TODO
  syncBlockchain(block) {
    console.log(Object.freeze(block))
    this.chain.push(Object.freeze(block))
    if (!this.isValid()) {
      this.chain.pop()
    }
  }

  isValid(blockchain = this) {
    for (let i = 1; i < blockchain.chain.length; i++) {
      const currentBlock = blockchain.chain[i]
      const prevBlock = blockchain.chain[i - 1]

      if (
        currentBlock.hash !== currentBlock.getHash() ||
        prevBlock.hash !== currentBlock.prevHash
      ) {
        console.error('❌ validtaion not passed!')
        return false
      }
    }
    console.error('✅ validated')
    return true
  }

  toString() {
    return JSON.stringify(this, null, 2)
  }
}
