const Router = require('koa-router')
const route = new Router()
const { ObjectId } = require('mongodb').ObjectId
const newId = () => ObjectId().toHexString()

const queue = async ctx => {
    const {
        to,
        subject,
        nickname,
        html
    } = ctx.request.body

    const {
        db,
        account
    } = ctx

    const {
        insertedId
    } = await db.collection('mail').insertOne({
        _id: newId(),
        mailer: account,
        from: account,
        nickname: nickname || account,
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