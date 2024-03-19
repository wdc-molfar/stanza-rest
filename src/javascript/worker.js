const Bridge = require("@molfar/py-bridge")
const path = require("path")
const config = require('../../config')

const Worker = class extends Bridge {

	constructor(){
		super(config.python)
		this.use("__run",path.resolve(__dirname,`../python/${config.python.script}`))
	}

	request(data) {
		return this.__run(data)
	}
}

module.exports =  () => {
	let worker = new Worker()
	worker.start()
	return worker
}