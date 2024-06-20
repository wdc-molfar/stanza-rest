const bodyParser = require('body-parser')
const express = require('express')
const CORS = require("cors")
const morgan = require("morgan")
const path = require("path")
const config  = require('./config')

// console.log(stanzaWorker)


const run = async () => {
        
        let stanzaWorker
        let summaryWorker
        let error
        
        console.log(config)

        try {
          stanzaWorker  = await require("./src/javascript/stanza-worker")()
        } catch(e) {
           console.log(e)
           error = e.toString() 
        }

        // try {
        //   summaryWorker  = await require("./src/javascript/summary-worker")()
        // } catch(e) {
        //    console.log(e)
        //    error = e.toString() 
        // }   

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


        routes = require("./src/javascript/service")(stanzaWorker, summaryWorker) 

        app.get("/", (req,res) => {
            res.send({
                service: "@molfar stanza RESTfull service",
                status: (error) ? error : "started"
            })
        })

        routes.forEach( route => {
            app[route.method](route.path, route.handler)
        })

        app.listen(config.service.port, () => {
          console.log(`@molfar stanza RESTfull service starts on port ${config.service.port} in ${config.service.mode} mode.`);
        });


}

run()

