import crypto, {
  createHash,
  createSign,
  createVerify,
  createSecretKey,
  createPublicKey,
} from 'crypto'
import WebSocket, {WebSocketServer} from 'ws'
import Blockchain from './Blockchain.js'
import Block from './Block.js'
import Transaction from './Transaction.js'
import {getPublicKeyToHex} from './utils.js'

const P2P_PORT = process.env.P2P_PORT || '3000'

export default class Node {
  #privateKey
  #validationMessages

  constructor(wallet) {
    this.port = P2P_PORT
    this.wallet = wallet
    this.knownNodes = []
    this.#validationMessages = {}
    this.blockchain = new Blockchain(this.wallet.publicKey)
  }

  run() {
    const server = new WebSocketServer({port: P2P_PORT})
    server.on('connection', socket => this.connectSocket(socket))
  }

  connectSocket(socket) {
    console.log(`Socket connected to you!`)
    this.messageHandler(socket)
  }

  messageHandler(socket) {
    socket.on('message', async message => {
      const parsedMessage = JSON.parse(message)
      if (parsedMessage.type === 'requestSign') {
        //handle validation
        this.responseToValidation(parsedMessage.payload)
        return
      } else if (parsedMessage.type === 'responseSign') {
        //handle validation
        this.handleResponseValidation(parsedMessage.payload)
        return
      } else if (parsedMessage.type === 'connect') {
        const {payload: data} = parsedMessage
        if (
          this.knownNodes.some(node => node.port == data.port) ||
          data.port === this.port
        ) {
          return
        }
        const {port, publicKey, withBlockchain} = data

        await this.connectToNode({
          port,
          publicKey,
          shouldConnectToBlockchain: withBlockchain,
        })

        return
      } else if (parsedMessage.type === 'sendBlockchain') {
        const {payload: data} = parsedMessage

        this.blockchain = new Blockchain(
          undefined,
          data.blockchain.difficulty,
          data.blockchain.chain.map(
            ({timestamp, transactions, prevHash, nonce}) =>
              new Block(
                timestamp,
                transactions?.map(
                  ({from, to, amount, signature}) =>
                    new Transaction(from, to, amount, signature),
                ),
                prevHash,
                nonce,
              ),
          ),
          data.blockchain.coinbaseKeyPair.publicKey,
          data.blockchain.coinbaseKeyPair.privateKey,
        )

        return
      } else if (parsedMessage.type === 'addBlock') {
        const {
          payload: {port, block, publicKey},
        } = parsedMessage

        // TODO: uncomment after public key moved to sockets
        if (
          !this.knownNodes.some(
            node => node.port == port && node.publicKey === publicKey,
          )
        ) {
          return
        }

        this.blockchain.syncBlockchain(
          new Block(
            block.timestamp,
            block.transactions?.map(
              ({from, to, amount, signature}) =>
                new Transaction(from, to, amount, signature),
            ),
            block.prevHash,
            block.nonce,
          ),
        )
        console.log('added block to blockchain, blockchain is synchronized ⛓️')
        return
      } else if (parsedMessage.type === 'addTransaction') {
        const {
          payload: {port, transaction, publicKey},
        } = parsedMessage
        if (
          !this.knownNodes.some(
            node => node.port == port && node.publicKey === publicKey,
          )
        ) {
          return
        }
        this.blockchain.addTransaction(
          new Transaction(
            transaction.from,
            transaction.to,
            transaction.amount,
            transaction.signature,
          ),
        )
        return
      }

      throw new Error('Unhandled message')
    })
  }

  connectToNode({
    port,
    isInitialConnection = false,
    shouldConnectToBlockchain = false,
    publicKey,
  }) {
    const socket = new WebSocket(`${process.env.WS_DEFAULT_HOST}${port}`)
    socket.on('open', () => {
      console.log(`You connected to node ${port}`)
      this.knownNodes.forEach(({socket: knownSocket, ...rest}) => {
        socket.send(JSON.stringify({payload: rest, type: 'connect'}))
      })
      socket.send(
        JSON.stringify({
          payload: {
            port: this.port,
            publicKey: this.wallet.publicKey,
            withBlockchain: isInitialConnection,
          },
          type: 'connect',
        }),
      )
      if (shouldConnectToBlockchain) {
        socket.send(
          JSON.stringify({
            payload: {
              port: this.port,
              publicKey: this.wallet.publicKey,
              blockchain: {
                ...this.blockchain,
                coinbaseKeyPair: {
                  ...this.blockchain.coinbaseKeyPair,
                  publicKey: getPublicKeyToHex(
                    this.blockchain.coinbaseKeyPair.publicKey,
                  ),
                },
              },
            },
            type: 'sendBlockchain',
          }),
        )
      }
    })

    if (this.knownNodes.some(node => node.port == port)) return
    if (!publicKey || !port || !socket) {
      return
    }
    this.knownNodes.push({port, socket, publicKey})
  }

  // 1. Wysyłasz wiadomość zwykłą jakąś
  // 2. On ci ją podpisuje
  // 3. Ty weryfikujesz podpis
  /** Validate node identity by sending message signed with their public key containing random hash message */
  requestValidation(node) {
    const message = createHash('sha256').digest('hex')
    this.#validationMessages = {
      ...this.#validationMessages,
      [node.publicKey]: message,
    }
    node.socket.send(
      JSON.stringify({
        type: 'requestSign',
        payload: {message, requestedFrom: this.wallet.publicKey},
      }),
    )
    setTimeout(() => {
      if (this.#validationMessages[node.publicKey] !== undefined) {
        console.log('Validation failed')
        this.knownNodes = this.knownNodes.filter(
          ({publicKey}) => publicKey !== node.publicKey,
        )
        this.#validationMessages[node.publicKey] = undefined
      }
    }, 5000)
  }

  responseToValidation(data) {
    const {message, requestedFrom} = data
    const sign = createSign('SHA256')
    sign.write(message)
    sign.end()
    const signature = sign.sign(this.wallet.getPrivateKey(), 'hex')
    const node = this.knownNodes.find(
      ({publicKey}) => publicKey === requestedFrom,
    )

    if (!node)
      return console.log(
        `Node with public key: ${requestedFrom} not found. Validation stopped.`,
      )
    node.socket.send(
      JSON.stringify({
        type: 'responseSign',
        payload: {signature, responseFrom: this.wallet.publicKey},
      }),
    )
  }

  handleResponseValidation(data) {
    const {signature, responseFrom} = data
    const verify = createVerify('SHA256')
    verify.write(this.#validationMessages[responseFrom] ?? '')
    verify.end()

    if (
      verify.verify(
        createPublicKey({
          key: Buffer.from(responseFrom, 'hex'),
          format: 'der', // Use DER encoding for elliptic curve keys
          type: 'spki',
          namedCurve: 'sect239k1',
        }),
        signature,
        'hex',
      )
    ) {
      console.log('Verify success')
      this.#validationMessages[responseFrom] = undefined
    } else {
      console.log('Verify failure')
    }
  }

  sendTransactionToPeers(transaction) {
    this.knownNodes.forEach(({socket}) => {
      socket.send(
        JSON.stringify({
          type: 'addTransaction',
          payload: {
            port: this.port,
            publicKey: this.wallet.publicKey,
            transaction,
          },
        }),
      )
    })
  }

  sendBlockToPeers(block) {
    this.knownNodes.forEach(({socket}) => {
      socket.send(
        JSON.stringify({
          type: 'addBlock',
          payload: {
            port: this.port,
            publicKey: this.wallet.publicKey,
            block,
          },
        }),
      )
    })
  }
}
