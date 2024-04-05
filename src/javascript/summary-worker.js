const Bridge = require("@molfar/py-bridge")
const normalize = require("./normalize-entities")
const path = require("path")
const config = require('../../config')
const uuid = require("uuid").v4
const exists = require("fs-extra").pathExists

let worker

const restartWorker = () =>  new Promise( (resolve, reject) => {
	
	console.log(`Restart ../python/${config.python.script.summary}`)
	
	if(worker){
		worker.terminate()
	}
	
	worker = new Worker()
	worker.start()


	const startCb = message => {
		console.log(message)
		worker.getShells()[0].shell.stdout.removeListener("data", startCb)			
		resolve()
	}

	worker.getShells()[0].shell.stdout.on("data", startCb)
	

	let m = ""
	const cb = message => {
		m += message
	}

	worker.getShells()[0].shell.stderr.on("data", cb)
	worker.getShells()[0].shell.on("close", (code, signal) => {
		// worker.getShells()[0].shell.stderr.removeListener("data", cb)
		// worker.terminate()
		reject(`Instance: ${(worker) ? worker.id : 'null'} for ../python/${config.python.script.summary} not started. ${m}`)
		worker = null
	})
	


	console.log(`Instance: ${worker.id} for ../python/${config.python.script.summary}`)

})

const Worker = class extends Bridge {

	constructor(){
		super(config.python)
		this.id = uuid()
		this.use("__summary",path.resolve(__dirname,`../python/${config.python.script.summary}`))
	}

	async request(data) {
		try {
			// console.log("worker request", data)
			let result = await this.__summary(data)
			// console.log(result)
			if( !result.error && result.data && result.data.response){
				 // result.data.response.named_entities = require("./raw-example.json")
				 result.data.response.named_entities = normalize(result.data.response.named_entities || [])
			} else {
				await restartWorker()
			}

			return result
		
		} catch (e) {

			try {

				console.log(e.toString())
				await restartWorker()				
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

module.exports =   async () => {
	try {
		await restartWorker()
		return {
			getInstance: async () => {
				try {
					if(!worker){
						await restartWorker()
					}
					return worker
				} catch(e) {
					throw new Error(e)			
				}	
			}	
		}
	} catch(e) {
		throw new Error(e)
	}	
}