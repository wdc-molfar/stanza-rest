module.exports = worker => ({
    method: "post",
    path: "/",
    handler: async (req, res) => {
    	
    	let result = await worker.request(req.body)
    	res.json(result)

    }
})