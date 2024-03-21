const Bridge = require("@molfar/py-bridge")
const normalize = require("./normalize-entities")
const path = require("path")
const config = require('../../config')

const Worker = class extends Bridge {

	constructor(){
		super(config.python)
		this.use("__nlp",path.resolve(__dirname,`../python/${config.python.script}`))
	}

	async request(data) {
		let result = await this.__nlp(data)
		if( !result.error && result.data && result.data.response){
			 // result.data.response.named_entities = require("./raw-example.json")
			 result.data.response.named_entities = normalize(result.data.response.named_entities || [])
		}
		return result
	}
}

module.exports =  () => {
	let worker = new Worker()
	worker.start()
	return worker
}