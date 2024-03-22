const Bridge = require("@molfar/py-bridge")
const normalize = require("./normalize-entities")
const path = require("path")
const config = require('../../config')

let worker

const restartWorker = () => {
	
	console.log("Restart stanza-worker")
	
	if(worker){
		worker.terminate()
	}
	
	worker = new Worker()
	worker.start()

}

const Worker = class extends Bridge {

	constructor(){
		super(config.python)
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