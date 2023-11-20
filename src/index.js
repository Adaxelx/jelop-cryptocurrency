import 'dotenv/config'
import Runner from './Runner.js'

const runner = new Runner()
;(async () => {
  await runner.run()
})()
