const pino=require('pino')
const expPino=require('express-pino-logger')
const logger=pino({
    level: 'info',
    prettyPrint: false,
    useLevelLabels: true
})


const expLogger=expPino({logger})

module.exports={logger,expLogger}