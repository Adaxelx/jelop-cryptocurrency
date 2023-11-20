import readlineSync from 'readline'
import Wallet from './Wallet.js'
import Node from './Node.js'
import Block from './Block.js'
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

  async run() {
    await this.promptForOptions()
  }

  async promptForOptions() {
    console.table({
      'Create wallet': {value: 1},
      'Connect to node': {value: 2},
      'Validate node': {value: 3},
      'Show wallet': {value: 4},
      'Add block': {value: 5},
    })
    this.terminal.question('Please input value: ', async value => {
      this.#selectedOption = value
      await this.handleStart()
      await this.promptForOptions()
    })
  }

  async handleStart() {
    console.log('You selected: ', this.#selectedOption)
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
          this.terminal.question('Enter public key of node: ', publicKey => {
            this.node.connectToNode(port, publicKey, true)
          })
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
      }
      case '5': {
        if (!this.node) {
          console.log('You need to have a wallet to add block!')
          break
        }
        this.terminal.question('From: ', from => {
          this.terminal.question('to: ', to => {
            this.terminal.question('amount: ', amount => {
              const block = new Block(Date.now().toString(), {from, to, amount})
              this.node.blockchain.addBlock(block)
              this.node.sendBlockToPeers(block)
            })
          })
        })
      }
      default:
        break
    }
  }
}
