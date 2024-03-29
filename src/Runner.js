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
      'Save wallet': {value: 9},
      'Load wallet': {value: 10},
      'Show connected': {value: 11},
      'Connect to node': {value: 2},
      'Validate node': {value: 3},
      'Show wallet': {value: 4},
      'Add transaction': {value: 5},
      'Show balance': {value: 6},
      'Show blockchain': {value: 7},
      'Mine transactions': {value: 8},
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
      case '9':
        if (!this.node) {
          console.log('You need to have a wallet!')
          break
        }
        // To save the wallet:
        this.terminal.question('Enter password: ', password => {
          this.node.wallet.saveToFile('myWallet.dat', password)
        })
        break
      case '10':
        // To save the wallet:
        this.terminal.question('Enter password: ', password => {
          const loadedWallet = Wallet.loadFromFile('myWallet.dat', password)
          if (!loadedWallet) {
            console.log('hasło niepoprawne')
            return
          }
          console.log('hasło poprawne')
          this.node = new Node(loadedWallet)
          this.node.run()
        })
        break
      case '11':
        if (!this.node) {
          console.log('You need to have a wallet to show connected nodes!')
          break
        }
        console.table(this.node.knownNodes.map(({port}) => ({port})))
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
      case '3':
        if (!this.node) {
          console.log('You need to create wallet first to validate any node!')
          break
        }
        this.terminal.question('Enter port: ', port => {
          const node = this.node.knownNodes.find(node => node.port === port)
          this.node.requestValidation(node)
        })
        break
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
            const balance = this.node.blockchain.getBalance(
              this.node.wallet.publicKey,
            )
            if (balance < Number(amount)) {
              console.log('You do not have enough 🤡s!')
              return
            }
            if (this.node.port === to) {
              console.log('You cannot send to yourself!')
              return
            }
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
            this.node.sendTransactionToPeers(transaction)
          })
        })

        break
      }
      case '6': {
        if (!this?.node?.blockchain) {
          console.log('You need to have a blockchain to show balance!')
          break
        }

        const balance = this.node.blockchain.getBalance(
          this.node.wallet.publicKey,
        )
        console.log(`Your balance is ${balance}🤡`)
        break
      }

      case '7': {
        if (!this?.node?.blockchain) {
          console.log('You need to have a blockchain to show it!')
          break
        }

        console.log(this.node.blockchain.toString())
        break
      }
      case '8': {
        if (!this?.node?.blockchain) {
          console.log('You need to have a blockchain to mine it!')
          break
        }
        this.node.blockchain.printListOfTransactions()
        this.terminal.question(
          'Select transactions (pass transaction number separated with comma)',
          value => {
            if (typeof value !== 'string') {
              console.log('Invalid input!')
              return
            }
            const transactionIds = value.split(',').map(Number)
            if (transactionIds.some(transaction => isNaN(transaction))) {
              console.log('Invalid input!')
              return
            }
            if (
              transactionIds.some(
                transaction =>
                  transaction < 1 ||
                  transaction > this.node.blockchain.transactions.length,
              )
            ) {
              console.log(
                `Invalid transaction number! - should be in range ${1} - ${
                  this.node.blockchain.transactions.length
                }`,
              )
              return
            }
            const block = this.node.blockchain.mineTransactions(
              this.node.wallet.publicKey,
              transactionIds,
            )
            this.node.sendBlockToPeers(block)
          },
        )

        break
      }
      default:
        break
    }
  }
}
