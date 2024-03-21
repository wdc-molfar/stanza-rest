const Bridge = require("@molfar/py-bridge")
const normalize = require("./normalize-entities")
const path = require("path")
const config = require('../../config')

let worker

const Worker = class extends Bridge {

	constructor(){
		super(config.python)
		this.use("__nlp",path.resolve(__dirname,`../python/${config.python.script}`))
	}

	async request(data) {
		try {
			
			let result = await this.__nlp(data)
			if( !result.error && result.data && result.data.response){
				 // result.data.response.named_entities = require("./raw-example.json")
				 result.data.response.named_entities = normalize(result.data.response.named_entities || [])
			}
			return result
		
		} catch (e) {

			try {

				worker.stop()
				worker = new Worker()
				worker.start()
				return {
					request: data,
					error: e.toString()
				}
			
			} catch (e) {

				return {
					request: data,
					error: e.toString()
				}

			}

		}	
	}
}

module.exports =  () => {
	worker = new Worker()
	worker.start()
	return worker
}