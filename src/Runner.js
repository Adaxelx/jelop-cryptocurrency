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
    // this.#selectedOption = prompt('Select your action:')
  }

  async promptForOptions() {
    console.table({
      'Create wallet': {value: 1},
      'Upload your wallet': {value: 2},
      'Connect to node': {value: 3},
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
      case '3':
        // if(!this.wallet){
        //   returnconsole.log("First create your own wallet!")
        // }
        this.terminal.question('Enter port: ', port => {
          this.terminal.question('Enter public key of node: ', publicKey => {
            this.node.connectToNode(port, publicKey)

            // setTimeout(() => {
            //   node.knownNodes.forEach(knownNode =>
            //     node.requestValidation(knownNode),
            //   )
            // }, 5000)
          })
        })

        console.log('case 3')
        break
      default:
        break
    }
  }
}
