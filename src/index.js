import Node from './Node.js'
import 'dotenv/config'
import Runner from './Runner.js'

// const node = new Node()
// node.run()
// setTimeout(() => {
//   node.knownNodes.forEach(knownNode => node.requestValidation(knownNode))
// }, 5000)

const runner = new Runner()
;(async () => {
  await runner.run()
})()
