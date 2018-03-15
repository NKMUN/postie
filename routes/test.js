const Router = require('koa-router')
const route = new Router()
const {queue} = require('./mail')

const createTestHtml = (account, from, to) => `
<div>
    <h3>Postie Test</h3>
    <pre>
from: ${account === from ? account : `${account} / ${from}`}
to: ${to}
time: ${new Date().toLocaleString()}
    </pre>
</div>
`

route.get('/test',
    async ctx => {
        const { mailfrom, account } = ctx
        const { from, to } = ctx.request.query

        if (!to) {
            ctx.status = 400
            ctx.body = { error: 'no recipient' }
            return
        }

        // inject test email
        ctx.request.body = {
            from: mailfrom || account,
            nickname: 'Postie',
            subject: 'Postie Test',
            html: createTestHtml(account, from, to),
            ...ctx.request.query
        }

        await queue(ctx)
    }
)

module.exports = {
    routes: route.routes()
}