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
			{ text: m}
		)
		tick.stop()
		
		console.log(index, m.length, benchmark.timers[m].parse(benchmark.timers[m].duration()))

		if(res.data) {
			res = res.data
			let ne = normalize(res.response.named_entities)
			console.log(ne)
		} else {
			console.log(res.error)
		}

	}
}


run()