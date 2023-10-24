import readlineSync from 'readline'
import Wallet from './Wallet.js'
import Node from './Node.js'
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
    })
    this.terminal.question('Please input value: ', async value => {
      this.#selectedOption = value
      await this.handleStart()
      this.promptForOptions()
    })
  }

  async handleStart() {
    console.log('You selected: ', this.#selectedOption)
    switch (this.#selectedOption) {
      case '1':
        // upload your wallet
        console.log('case 1')

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
            this.node.connectToNode(port, publicKey)
          })
        })

        console.log('case 2')
        break
      case '3': {
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
      default:
        break
    }
  }
}
