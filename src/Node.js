import crypto, {createHash} from 'crypto'
import WebSocket, {WebSocketServer} from 'ws'

const P2P_PORT = process.env.P2P_PORT || '3000'

export default class Node {
  #privateKey
  #knownNodes

  constructor() {
    const {privateKey, publicKey} = crypto.generateKeyPairSync('ec', {
      namedCurve: 'sect233k1',
    })

    console.log(`Public key: ${getPublicKeyToHex(publicKey)}`)

    this.publicKey = getPublicKeyToHex(publicKey)
    this.#privateKey = privateKey
    this.port = P2P_PORT
    this.#knownNodes = this.parseKnownNodes()
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

    this.#knownNodes.forEach(({socket, ...data}) => {
      socket.send(JSON.stringify({publicKey: this.publicKey, port: this.port}))
    })
  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message)
      if (this.#knownNodes.some(node => node.port == data.port)) return
      this.#knownNodes.push({...data, socket})
      this.#knownNodes.forEach(({socket: knownSocket, ...rest}) => {
        knownSocket.send(JSON.stringify(data))
        socket.send(JSON.stringify(rest))
      })

      console.log(this.#knownNodes.map(({socket, publicKey, ...data}) => data))
    })
  }

  connectKnownNodes() {
    this.#knownNodes = this.#knownNodes.map(peer => {
      const socket = new WebSocket(`${process.env.WS_DEFAULT_HOST}${peer.port}`)

      socket.on('open', () => this.connectSocket(socket))

      return {...peer, socket}
    })
  }

  /** Validate node identity by sending message signed with their public key containing random hash message */
  validateIdentity(node) {
    const message = createHash('sha256').digest('hex')
  }
}

const getPublicKeyToHex = publicKey => {
  return publicKey.export({type: 'spki', format: 'der'}).toString('hex')
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
*/
