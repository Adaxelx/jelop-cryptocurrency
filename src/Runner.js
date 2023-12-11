import readlineSync from 'readline'
import Wallet from './Wallet.js'
import Node from './Node.js'
import Block from './Block.js'
import Transaction from './Transaction.js'
export default class Runner {
  #selectedOption
  constructor() {
    this.#selectedOption = null
    this.terminal = readlineSync.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    this.node = undefined
  }

  run() {
    this.promptForOptions()
    this.terminal.on('line', input => {
      this.promptForOptions()
    })
  }

  promptForOptions() {
    console.log('\n')
    console.table({
      'Create wallet': {value: 1},
      'Connect to node': {value: 2},
      'Validate node': {value: 3},
      'Show wallet': {value: 4},
      'Add transaction': {value: 5},
      'Show balance': {value: 6},
      'Show blockchain': {value: 7},
    })
    console.log('\n')
    this.terminal.question('Please input value: ', value => {
      this.#selectedOption = value
      this.handleStart()
    })
  }

  handleStart() {
    switch (this.#selectedOption) {
      case '1':
        // upload your wallet
        const wallet = new Wallet()
        this.node = new Node(wallet)
        this.node.run()

        break
      case '2':
        if (!this.node) {
          console.log('You need to have a wallet to make a connection!')
          break
        }
        this.terminal.question('Enter port: ', port => {
          this.node.connectToNode({port, shouldConnectToBlockchain: true})
        })

        break
      case '3': {
        if (!this.node) {
          console.log('You need to create wallet first to validate any node!')
          break
        }
        this.terminal.question('Enter port: ', port => {
          const node = this.node.knownNodes.find(node => node.port === port)
          this.node.requestValidation(node)
        })
      }
      case '4': {
        if (!this.node) {
          console.log('You need to have a wallet to show it!')
          break
        }
        this.node.wallet.show()
        break
      }
      case '5': {
        if (!this.node) {
          console.log('You need to have a wallet to add block!')
          break
        }

        this.terminal.question('to (port): ', to => {
          this.terminal.question('amount: ', amount => {
            const transaction = new Transaction(
              this.node.wallet.publicKey,
              this.node.knownNodes.find(node => node.port === to).publicKey,
              Number(amount),
            )
            transaction.sign({
              publicKey: this.node.wallet.publicKey,
              privateKey: this.node.wallet.getPrivateKey(),
            })
            this.node.blockchain.addTransaction(transaction)
            const block = this.node.blockchain.mineTransactions(
              this.node.wallet.publicKey,
            )
            this.node.sendBlockToPeers(block)
          })
        })

        break
      }
      case '6': {
        const balance = this.node.blockchain.getBalance(
          this.node.wallet.publicKey,
        )
        console.log(`Your balance is ${balance}🤡`)
        break
      }

      case '7': {
        console.log(this.node.blockchain.toString())
        break
      }
      default:
        break
    }
  }
}
