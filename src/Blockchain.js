import Block from './Block.js'

export default class Blockchain {
  constructor(difficulty = 1, chain = [new Block(Date.now().toString())]) {
    this.chain = chain
    this.difficulty = difficulty
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(block) {
    this.connectToLastBlock(block)
    block.mine(this.difficulty)

    this.chain.push(Object.freeze(block))
    console.log(this.toString())
  }

  connectToLastBlock(block) {
    block.prevHash = this.getLastBlock().hash
    block.hash = block.getHash()
  }

  syncBlockchain(block) {
    this.connectToLastBlock(block)
    this.chain.push(Object.freeze(block))
    if (!this.isValid()) {
      this.chain.pop()
    }
    console.log('New blockchain: ', this.toString())
  }

  isValid(blockchain = this) {
    const [INITIAL_BLOCK, ...chain] = blockchain.chain

    for (const currentIndex in chain) {
      const isFirst = Number(currentIndex) === 0
      const prevBlock = isFirst ? INITIAL_BLOCK : chain[currentIndex - 1]
      const currentBlock = chain[currentIndex]
      if (
        currentBlock.hash !== currentBlock.getHash() ||
        prevBlock.hash !== currentBlock.prevHash
      ) {
        console.error('❌ validtaion not passed!')
        return false
      }
    }

    console.log('✅ validtaion passed!')
    return true
  }

  toString() {
    return JSON.stringify(this, null, 2)
  }
}
