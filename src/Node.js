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

const P2P_PORT = process.env.P2P_PORT || '3000'

export default class Node {
  #privateKey
  #validationMessages

  constructor(wallet) {
    this.port = P2P_PORT
    this.wallet = wallet
    this.knownNodes = []
    this.#validationMessages = {}
    this.blockchain = new Blockchain()
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
        console.log('request')
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

        console.log(this.knownNodes.map(({socket, ...data}) => data))
        return
      } else if (parsedMessage.type === 'sendBlockchain') {
        const {payload: data} = parsedMessage

        this.blockchain = new Blockchain(
          data.blockchain.difficulty,
          data.blockchain.chain,
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
          new Block(block.timestamp, block.data, block.prevHash, block.nonce),
        )
        this.blockchain.isValid()
        console.log('added block to blockchain, blockchain is synchronized ⛓️')
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
              blockchain: this.blockchain,
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
    } else {
      console.log('Verify failure')
    }
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

// TODO:
/* 
Tworzenie tosamości cyfrowej
    - Tutaj rozumiem utworzenie Node, klucza publicznego i prywatnego
Przechowywanie kluczy w cyfrowym portfelu:
    - Trzymanie kluczy(publicznych) innych nodeów w celu możliwości wysyłania im szyfrowanych messageów
Weryfikacja tożsamości węzła
    - Rozumiem że tutaj przykładowo będzie wysłana wiadomość, która jest do odkodowania za pomocą publicznego klucza
    przez wysyłającego. Jeśli zaszyfrowana wiadomość kluczem prywatnym daje się odkodować danym kluczem publicznym to znaczy
    ze ta osoba jest tym za kogo się podaje
- Uruchomienie i rejestracja węzła 
    - Podanie portu innego węzła (oraz jego klicza publicznego (?)), wysłanie mu wiadomości zaszyfrowanej tym kluczem (np swój klucz publiczny), następnie on wysyła ci wiadomość zaszyfrowaną twoim
    kluczem publicznym (tak żebyś ty go mógł dodać do znanych nodeów)


      {
    type: "connect",
    payload: {}
  }

  {
    type: 'verify',
   payload: {}
  }
*/
