import Node from './Node.js'
import 'dotenv/config'

const node = new Node()
node.run()
setTimeout(() => {
  node.knownNodes.forEach(knownNode => node.requestValidation(knownNode))
}, 5000)
