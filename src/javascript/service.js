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

    	// console.log(worker)

		validate(req.body)
    	if (validate.errors) {
    	
    		res.json({
    			request: req.body,
    			error: `Bad request body format.\n${validate.errors.map( e => "On the path " + (e.instancePath || '#') + ":" + e.message ).join('')}`
			})
		
		} else {	
	    	
	    	if(!req.body.text.trim()){
	    		res.json({
	    			request: req.body,
	    			error: `Bad request. The text must not be an empty string and must not contain only whitespaces.`
				})
				return		
	    	}

	    	if(!worker) {
	    		try {
		          worker  = await require("./worker")()
		        } catch(e) {
		           console.log(e)
		           res.json({
	    				request: req.body,
	    				error: e.toString()
	    			})
		           return
		        } 
	    	}

	    	let result =  await ( await worker.getInstance()).request(req.body)
	    	
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