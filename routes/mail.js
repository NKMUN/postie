const Router = require('koa-router')
const route = new Router()
const { ObjectId } = require('mongodb').ObjectId
const newId = () => ObjectId().toHexString()
const EmailValidator = require('email-validator')
const validateEmail = s => EmailValidator.validate(s)

const queue = async ctx => {
    const {
        from,
        to,
        subject,
        nickname,
        html
    } = ctx.request.body

    const {
        db,
        account,
        mailfrom
    } = ctx

    const decidedMailFrom = from || mailfrom || account

    if ( !validateEmail(decidedMailFrom) ) {
        if ( !validateEmail(account) ) {
            ctx.status = 400
            ctx.body = {
                error: 'missing mail from',
                description: 'default mailfrom not provided, from field is mandatory'
            }
        } else {
            ctx.status = 400
            ctx.body = {
                error: 'malformed mail from',
                description: 'maiformed mail from'
            }
        }
        return
    }

    const {
        insertedId
    } = await db.collection('mail').insertOne({
        _id: newId(),
        mailer: account,
        from: decidedMailFrom,
        nickname: nickname || decidedMailFrom,
        to,
        subject,
        html,
        created: new Date(),
        priority: 0,
        state: 'queued'
    })

    ctx.status = 202
    ctx.body = { id: insertedId }
}

route.post('/mails/', queue)

module.exports = {
    queue: queue,
    routes: route.routes()
}