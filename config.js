const path = require("path")

module.exports = {

	service:{
		mode: process.env.NODE_ENV || "development",
		port: process.env.PORT || 3001,
		host: process.env.HOST || "localhost",
	},

	python: {
		mode: 'text',
		encoding: 'utf8',
		pythonOptions: ['-u'],
		script: 'stub.py', // TODO change to real stanza worker script 
		pythonPath: (process.env.NODE_ENV && process.env.NODE_ENV == "production") ? 'python' : 'python.exe'
	}
}
