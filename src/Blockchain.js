import Block from './Block.js'
import {generateKeyPair, getPublicKeyToHex} from './utils.js'
import Transaction from './Transaction.js'
export default class Blockchain {
  constructor(
    creatorAddress = undefined,
    difficulty = 5,
    chain,
    publicKey,
    privateKey,
  ) {
    this.difficulty = 1
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

  mineTransactions(rewardAddress, transactionIds) {
    // Create a COINSBASE transaction for reward.
    if (
      this.transactions.length === 0 ||
      this.transactions.length < transactionIds.length
    ) {
      console.log('No transactions to mine!')
      return
    }
    const transactionsToMine = transactionIds.map(
      transactionId => this.transactions[transactionId - 1],
    )

    const rewardTransaction = this.createCoinbaseTransaction(rewardAddress)
    rewardTransaction.sign(this.coinbaseKeyPair)

    // We will add the reward transaction into the pool.
    const block = new Block(Date.now().toString(), [
      rewardTransaction,
      ...transactionsToMine,
    ])

    this.addBlock(block)

    this.transactions = this.transactions.filter(transaction =>
      transactionsToMine.every(tx => tx.signature !== transaction.signature),
    )
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

  // Format transactions into a list so that it have all data of transactions preceded with number from 1 to N
  printListOfTransactions() {
    this.transactions.forEach((transaction, index) => {
      console.log(`[${index + 1}]. ${transaction.toString()}`)
    })
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1]
  }

  isNotCoinbaseTransaction = transaction => {
    return (
      transaction.from !== getPublicKeyToHex(this.coinbaseKeyPair.publicKey)
    )
  }

  addBlock(block) {
    this.connectToLastBlock(block)
    block.mine(this.difficulty)
    block.timestamp = Date.now().toString()

    this.chain.push(Object.freeze(block))
  }

  connectToLastBlock(block) {
    this.connectToNBlock(block)
  }

  connectToNBlock(block, blockToConnect = this.getLastBlock()) {
    block.prevHash = blockToConnect.hash
    block.hash = block.getHash()
  }

  getIndexOfBlockToConnect(block) {
    for (let i = this.chain.length - 1; i >= 0; i--) {
      if (this.chain[i].hash === block.prevHash) {
        return i
      }
    }
  }

  syncBlockchain(block) {
    const index = this.getIndexOfBlockToConnect(block)
    if (typeof index === 'undefined') {
      console.log('Invalid block - rejected')
      return
    }
    if (index !== this.chain.length - 1) {
      const blockToBeReplaced = this.chain[index + 1]
      if (blockToBeReplaced.timestamp < block.timestamp) {
        console.log('This block is older than the block you have - rejected')
        return
      }
      const blocksToBeReplaced = this.chain.slice(index + 1)
      this.transactions = [
        ...this.transactions,
        ...blocksToBeReplaced
          .flatMap(block => block.transactions)
          .filter(this.isNotCoinbaseTransaction),
      ].filter(
        transaction =>
          !block.transactions.some(
            tx => tx.signature === transaction.signature,
          ),
      )

      this.chain = this.chain.slice(0, index + 1)
    }
    this.connectToLastBlock(block)
    this.chain.push(Object.freeze(block))
    console.log(this.isValid())
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
        currentBlock.getHash().slice(0, this.difficulty) !==
          new Array(this.difficulty).fill(0).join('') ||
        prevBlock.hash !== currentBlock.prevHash ||
        !currentBlock.hasValidTransactions(blockchain)
      ) {
        console.log('❌ validtaion failed!')
        return false
      }
    }

    console.log('✅ validtaion passed!')
    return true
  }

  toString() {
    const {coinbaseKeyPair, ...blockchain} = this
    return JSON.stringify(blockchain, null, 2)
  }
}
