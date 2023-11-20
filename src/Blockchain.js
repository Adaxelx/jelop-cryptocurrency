export default class Blockchain {
  constructor() {
    // Create our genesis block
    this.chain = [new Block(Date.now().toString())]
    this.difficulty = 1
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(block) {
    // Since we are adding a new block, prevHash will be the hash of the old latest block
    block.prevHash = this.getLastBlock().hash
    // Since now prevHash has a value, we must reset the block's hash
    block.hash = block.getHash()
    block.mine(this.difficulty)

    // Object.freeze ensures immutability in our code
    this.chain.push(Object.freeze(block))
  }
  isValid(blockchain = this) {
    // Iterate over the chain, we need to set i to 1 because there are nothing before the genesis block, so we start at the second block.
    // The chain is valid if a block's hash is equal to what its hashing method returns, and a block's prevHash property should be equal to the previous block's hash.
    for (let i = 1; i < blockchain.chain.length; i++) {
      const currentBlock = blockchain.chain[i]
      const prevBlock = blockchain.chain[i - 1]

      // Check validation
      if (
        currentBlock.hash !== currentBlock.getHash() ||
        prevBlock.hash !== currentBlock.prevHash
      ) {
        return false
      }
    }

    return true
  }
}
