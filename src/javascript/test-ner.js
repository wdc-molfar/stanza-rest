const normalize = require("./normalize-entities")
const benchmark = require('exectimer')
let messages = require("./messages.json")
const axios = require("axios")

// let tick = new benchmark.Tick(filePath);
// tick.start()
// tick.stop()
// benchmark.timers[filePath].parse(benchmark.timers[filePath].duration())



const run = async () => {
	let index = 1
	
	for( const m of messages){
		
		let tick = new benchmark.Tick(m)
		tick.start()
		let res = await axios.post(
			"https://stanza.molfar.stream/",
			// "http://localhost:3001/",
			{ text: m }
		)
		tick.stop()
		
		console.log(index, ". Message length:", m.length, "Duration: ", benchmark.timers[m].parse(benchmark.timers[m].duration()))
		index++

		if(res.data) {
			console.log(res.data)
		} else {
			console.log(res.error)
		}

	}
}


run()