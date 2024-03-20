const Bridge = require("@molfar/py-bridge")
const normalize = require("./normalize-entities")
const path = require("path")
const config = require('../../config')

const Worker = class extends Bridge {

	constructor(){
		super(config.python)
		this.use("__run",path.resolve(__dirname,`../python/${config.python.script}`))
	}

	request(data) {
		let result = this.__run(data)
		result.response.named_entities = normalize(result.response.named_entities)
		return result
	}
}

module.exports =  () => {
	let worker = new Worker()
	worker.start()
	return worker
}