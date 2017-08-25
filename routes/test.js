const Router = require('koa-router')
const route = new Router()
const {queue} = require('./mail')

const createTestHtml = (from, to) => `
<div>
    <h3>Postie Test</h3>
    <pre>
from: ${from}
to: ${to}
time: ${new Date().toLocaleString()}
    </pre>
</div>
`

route.get('/test',
    async ctx => {
        const { mail } = ctx.query
        const { account } = ctx
        
        // inject test email
        ctx.body = {
            from: account,
            nickname: 'Postie',
            to: mail,
            subject: 'Postie Test',
            html: createTestHtml(account, mail)
        }
        await queue(ctx)
    }
)

module.exports = {
    routes: route.routes()
}