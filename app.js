
'use strict'

require('dotenv-extended').load();

/**
 * Module Dependencies
 */
const restify       = require('restify'),
      bunyan        = require('bunyan'),
      winston       = require('winston'),
      bunyanWinston = require('bunyan-winston-adapter'),
      MongoClient   = require('mongodb').MongoClient

/**
 * Logging
 */
const tsFormat = () => new Date().toString();

global.log = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'info',
            timestamp: tsFormat,
            json: true,
            colorize:true,
        }),
        new winston.transports.File({
            filename: 'logs/access.log',
            timestamp: tsFormat,
            level:  process.env.env === 'development' ? 'silly' : 'info',
            json: true
        })
    ],
})

/**
 * Initialize Server
 */
global.server = restify.createServer({
    name    : process.env.name,
    version : process.env.version,
    log     : bunyanWinston.createAdapter(log),
})

/**
 * Middleware
 */
server.use(restify.jsonBodyParser({ mapParams: true }))
server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser({ mapParams: true }))
server.use(restify.CORS())
server.use(restify.fullResponse())
server.use(restify.authorizationParser())

restify.CORS.ALLOW_HEADERS.push('authorization');
restify.CORS.ALLOW_HEADERS.push('x-access-token');



/**
 * Error Handling
 */
server.on('uncaughtException', (req, res, route, err) => {
    log.error(err.stack)
    res.send(err)
});


/**
 * Lift Server, Connect to DB & Bind Routes
 */
server.listen(process.env.port, function() {
    //TODO - MONGODB AUTH AND Write Concern
    MongoClient.connect(process.env.mongourl, (err, database) => {
        if(err) {
            log.error('MongoDB default connection error: ' + err)
            process.exit(1)
        }

        log.info(
                '%s v%s ready to accept connections on port %s in %s environment.',
                server.name,
                process.env.version,
                process.env.port,
                process.env.env
            )
        global.db = database
    })
    
    
   
    require('./routes')     
})