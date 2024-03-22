const Bridge = require("@molfar/py-bridge")
const normalize = require("./normalize-entities")
const path = require("path")
const config = require('../../config')
const uuid = require("uuid").v4
const exists = require("fs-extra").pathExists

let worker

const restartWorker = () => {
	
	console.log(`Restart ../python/${config.python.script}`)
	
	if(worker){
		worker.terminate()
	}
	
	worker = new Worker()
	worker.start()
	
	worker.getShells()[0].shell.stderr.on("data", message => {
		console.log(`*** ERROR *** Instance: ${worker.id} for ../python/${config.python.script} not started.`)
		console.log(message)

	})

	console.log(`Instance: ${worker.id} for ../python/${config.python.script} started.`)

}

const Worker = class extends Bridge {

	constructor(){
		super(config.python)
		this.id = uuid()
		this.use("__nlp",path.resolve(__dirname,`../python/${config.python.script}`))
	}

	async request(data) {
		try {
			console.log("worker request", data)
			let result = await this.__nlp(data)
			console.log(result)
			if( !result.error && result.data && result.data.response){
				 // result.data.response.named_entities = require("./raw-example.json")
				 result.data.response.named_entities = normalize(result.data.response.named_entities || [])
			} else {
				restartWorker()
			}

			return result
		
		} catch (e) {

			try {

				console.log(e.toString())
				restartWorker()				
				return {
					request: data,
					error: e.toString()
				}
			
			} catch (e) {
				console.log(e.toString())
				return {
					request: data,
					error: e.toString()
				}

			}

		}	
	}
}

module.exports =  () => {
	restartWorker()
	return {
		getInstance: () => worker
	}
}