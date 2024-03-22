const bodyParser = require('body-parser')
const express = require('express')
const CORS = require("cors")
const morgan = require("morgan")
const path = require("path")
const config  = require('./config')

const stanzaWorker = require("./src/javascript/worker")()
// console.log(stanzaWorker)


const app = express();

app.use(CORS({
    origin: '*'
}))

app.use(morgan('dev'))

app.use(bodyParser.text());

app.use(bodyParser.urlencoded({
        parameterLimit: 100000,
        limit: '50mb',
        extended: true
    }));

    app.use(bodyParser.json({
        limit: '50mb'
    }));


routes = [ require("./src/javascript/service")(stanzaWorker) ]

app.get("/", (req,res) => {
	res.send({service: "@molfar stanza RESTfull service"})
})

routes.forEach( route => {
	app[route.method](route.path, route.handler)
})

app.listen(config.service.port, () => {
  console.log(`@molfar stanza RESTfull service starts on port ${config.service.port} in ${config.service.mode} mode.`);
});
