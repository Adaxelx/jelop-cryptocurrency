import Block from './Block.js'
import {generateKeyPair, getPublicKeyToHex} from './utils.js'
import Transaction from './Transaction.js'
export default class Blockchain {
  constructor(
    creatorAddress = undefined,
    difficulty = 1,
    chain,
    publicKey,
    privateKey,
  ) {
    this.difficulty = difficulty
    this.transactions = []
    this.reward = 10 // random value
    if (publicKey && privateKey) {
      this.coinbaseKeyPair = {
        privateKey,
        publicKey: Buffer.from(publicKey, 'hex'),
      }
    } else {
      const {publicKey, privateKey} = generateKeyPair()
      this.coinbaseKeyPair = {privateKey, publicKey}
    }

    this.createCoinbaseTransaction = creatorAddress =>
      new Transaction(
        getPublicKeyToHex(this.coinbaseKeyPair.publicKey),
        creatorAddress,
        this.reward,
      )

    const transaction = this.createCoinbaseTransaction(creatorAddress)
    transaction.sign(this.coinbaseKeyPair)
    this.chain =
      typeof chain === 'undefined'
        ? [new Block(Date.now().toString(), [transaction])]
        : chain
  }

  addTransaction(transaction) {
    if (transaction.isValid(transaction, this)) {
      this.transactions.push(transaction)
    }
  }

  mineTransactions(rewardAddress) {
    // Create a COINSBASE transaction for reward.
    const rewardTransaction = this.createCoinbaseTransaction(rewardAddress)
    rewardTransaction.sign(this.coinbaseKeyPair)

    // We will add the reward transaction into the pool.
    const block = new Block(Date.now().toString(), [
      rewardTransaction,
      ...this.transactions,
    ])

    this.addBlock(block)

    // Right now, we are just going assume the "from" address is something like this,
    // we will get back to this later in the next part of the article.
    this.transactions = []
    return block
  }

  getBalance(address) {
    let balance = 0

    this.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        // Because if you are the sender, you are sending money away, so your balance will be decremented.
        if (transaction.from === address) {
          balance -= transaction.amount
        }

        // But if you are the receiver, you are receiving money, so your balance will be incremented.
        if (transaction.to === address) {
          balance += transaction.amount
        }
      })
    })

    return balance
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1]
  }

  addBlock(block) {
    this.connectToLastBlock(block)
    block.mine(this.difficulty)

    this.chain.push(Object.freeze(block))
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
        prevBlock.hash !== currentBlock.prevHash ||
        !currentBlock.hasValidTransactions(blockchain)
      ) {
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
