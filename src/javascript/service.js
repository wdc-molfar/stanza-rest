const { extend } = require("lodash")
const Ajv = require('ajv').default;
const ajv = new Ajv({ allErrors: true });
require('ajv-formats')(ajv);
require('ajv-errors')(ajv /* , {singleError: true} */);



const schema = {
	type: "object",
	required: ["text"],
	properties:{
		text: {
			type: "string"
		},
		additionalProperties: true
	}
}


const validate = ajv.compile(schema)




module.exports = worker => ({
    method: "post",
    path: "/",
    handler: async (req, res) => {
		validate(req.body)
    	if (validate.errors) {
    	
    		res.json({
    			request: req.body,
    			error: `Bad request body format. ${JSON.stringify(req.body, null, '')}\n${validate.errors.map( e => "On the path " + (e.instancePath || '#') + ":" + e.message ).join('')}`
			})
		
		} else {	
	    
	    	let result = await worker.request(req.body)
	    	// console.log(result)
	    	let response = (result.data.error) 
	    		? 	{
	    				request: result.request,
	    				error: result.data.error
	    			}
	    		:   {
	    				request: result.request,
	    				response: extend( {}, result.data.response )
	    			}	

	    	res.json(response)
	    
	    }	

    }
})