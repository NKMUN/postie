const Koa = require('koa')
const KoaBody = require('koa-body')
const AccessLog = require('koa-accesslog')
const MongoSanitize = require('koa-mongo-sanitize')
const {createServer} = require('http')
const createMailer = require('./lib/create-mailer')
const createMailQueue = require('./mail-queue')

module.exports = {
    async create({
        port = 8003,
        host = 'localhost',
        db = 'mongodb://localhost:27017/test',
        smtpPort = 465,
        smtpHost,
        account,
        password,
        nickname,
        dsnMail
    }) {
        const app = new Koa()
        app.on('error', err => console.error(err.stack))
        app.proxy = true
        app.context.db = await require('mongodb').MongoClient.connect(db)
        app.context.account = account
        app.context.dsnMail = dsnMail
        app.context.mailer = createMailer({
            port: smtpPort,
            host: smtpHost,
            account: account,
            password: password
        })

        // ensure index is created to speed up lookup
        await app.context.db.collection('mail').createIndex({mailer: 1, state: 1, priority: 1, created: 1})

        app.use( AccessLog() )
        app.use( KoaBody() )
        app.use( MongoSanitize() )
        app.use( require('./routes/mail').routes )
        app.use( require('./routes/test').routes )

        let queue = createMailQueue(app.context)

        let server = createServer( app.callback() )

        server.listen(port, host, () => {
            let {address, port, family} = server.address()
            if (family === 'IPv6')
                address = `[${address}]`
            console.log(`Server listening on: ${address}:${port}`)
        })

        // graceful shutdown
        app.context.shutdown = () => {
            queue.stop()
            server.close()
            app.context.db.close()
        }

        return server
    }
}