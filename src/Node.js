import crypto, {
  createHash,
  createSign,
  createVerify,
  createSecretKey,
  createPublicKey,
} from 'crypto'
import WebSocket, {WebSocketServer} from 'ws'

const P2P_PORT = process.env.P2P_PORT || '3000'

export default class Node {
  #privateKey
  #validationMessages

  constructor() {
    const {privateKey, publicKey} = crypto.generateKeyPairSync('ec', {
      namedCurve: 'sect239k1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'der', // Use DER encoding for elliptic curve keys
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    })

    this.publicKey = getPublicKeyToHex(publicKey)
    this.#privateKey = privateKey
    this.port = P2P_PORT
    this.knownNodes = this.parseKnownNodes()
    this.#validationMessages = {}
  }

  parseKnownNodes() {
    let knownNodes
    try {
      knownNodes = JSON.parse(process.env.PEERS.toString())
    } catch {
      knownNodes = []
    }

    return knownNodes
  }

  run() {
    const server = new WebSocketServer({port: P2P_PORT})
    server.on('connection', socket => this.connectSocket(socket))

    this.connectKnownNodes()
  }

  connectSocket(socket) {
    console.log('Socket connected')
    this.messageHandler(socket)

    this.knownNodes.forEach(({socket, ...data}) => {
      socket.send(
        JSON.stringify({
          payload: {publicKey: this.publicKey, port: this.port},
          type: 'connect',
        }),
      )
    })
  }

  messageHandler(socket) {
    socket.on('message', message => {
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
        if (this.knownNodes.some(node => node.port == data.port)) return
        this.knownNodes.push({...data, socket})
        this.knownNodes.forEach(({socket: knownSocket, ...rest}) => {
          knownSocket.send(JSON.stringify({payload: data, type: 'connect'}))
          socket.send(JSON.stringify({payload: rest, type: 'connect'}))
        })

        // console.log(this.knownNodes.map(({socket, publicKey, ...data}) => data))
        return
      }
      throw new Error('Unhandled message')
    })
  }

  connectKnownNodes() {
    this.knownNodes = this.knownNodes.map(peer => {
      const socket = new WebSocket(`${process.env.WS_DEFAULT_HOST}${peer.port}`)

      socket.on('open', () => this.connectSocket(socket))

      return {...peer, socket}
    })
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
        payload: {message, requestedFrom: this.publicKey},
      }),
    )
  }

  responseToValidation(data) {
    const {message, requestedFrom} = data
    const sign = createSign('SHA256')
    sign.write(message)
    sign.end()
    const signature = sign.sign(this.#privateKey, 'hex')
    const node = this.knownNodes.find(
      ({publicKey}) => publicKey === requestedFrom,
    )
    if (!node) return
    node.socket.send(
      JSON.stringify({
        type: 'responseSign',
        payload: {signature, responseFrom: this.publicKey},
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
      console.log('verify success')
    } else {
      console.log('verify failure')
    }
  }
}

const getPublicKeyToHex = publicKey => {
  return publicKey.toString('hex')
}

const toHex = obj => {
  const str = JSON.stringify(obj)
  return '0x' + [...str].map((c, i) => str.charCodeAt(i).toString(16)).join('')
}

function hexToAscii(str1) {
  const hex = str1.toString()
  let str = ''
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
  }
  return str
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
