const { find, first, last, isArray } = require("lodash")



const normalizeEntities = data => {

	let entitiesTags = data.filter( d => d.ner && d.ner != "O")
	let sequences = []
	let index = 0

	while( index < entitiesTags.length ){
		
		
		if( entitiesTags[index].ner.startsWith("S-")){
			sequences.push([entitiesTags[index]])
			index++
			continue
		}


		if( entitiesTags[index].ner.startsWith("B-") ){
			let pool = []
			for( let i = index; i < entitiesTags.length && ["B", "I", "E"].includes(entitiesTags[i].ner.split("-")[0]); i++){
				pool.push(entitiesTags[i])
				index++
				if(entitiesTags[i].ner.split("-")[0] == "E"){
					sequences.push(pool)
					break		
				}
			}
			continue
		}

		index++
	
	}


	// console.log(JSON.stringify(sequences, null, " "))

	let result = sequences.map( s => {
		if (s[0].ner.startsWith("S-")) {
			let id = (isArray(s[0].id)) ? s[0].id[0] : s[0].id
			let f = find(data, d => d.id == id)
			return {
				name: f.lemma,
				tag: last(s[0].ner.split("-")),
				range: {
					start: s[0].start_char,
					end: s[0].end_char
				} 
			}
		}

		if (s[0].ner.startsWith("B-")) {
			
			return {
				name: s.map( d => d.text).join(" "),
				tag: last(s[0].ner.split("-")),
				range: {
					start: first(s).start_char,
					end: last(s).end_char
				} 
			}
		
		}
	
	})


	return result

}


module.exports = normalizeEntities