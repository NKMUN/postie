async function executor({
    db,
    mailer,
    account,
    dsnMail,
    shutdown
}, {
    retry: maxRetry
}) {
    // if mongodb blow up, call shutdown()
    // MongoClient won't recover if connection is lost
    try {
        const {
            value: mail
        } = await db.collection('mail').findOneAndUpdate(
            { mailer: account, state: 'queued' },
            { $set: { state: 'delivering' } },
            { sort: { priority: 1, created: 1} }
        )

        if (!mail) return

        await db.collection('mail').updateOne(
            { _id: mail._id },
            { $set: {
                state: 'delivering'
            } }
        )

        // TODO: wait for object spread
        let error = await mailer.sendMail(Object.assign(
            {
                from: { name: mail.nickname, address: mail.from },
                to: mail.to,
                subject: mail.subject,
                html: mail.html,
                messageId: mail._id + (+new Date())
            },
            dsnMail && {
                id: mail._id,
                return: 'headers',
                notify: ['failure', 'delay'],
                recipient: dsnMail
            }
        )).then(info => {
            console.log(info)
            if (parseInt(info.response, 10) === 250)
                return null
            else
                return { smtp: info }
        }, err => {
            return { error: err.message }
        })

        if (error) {
            await db.collection('mail').updateOne(
                { _id: mail._id},
                { $inc: { retry: 1, priority: 1 },
                  $push: { errors: error },
                  $set: { state: mail.retry >= maxRetry - 1 ? 'failed' : 'queued' }
                }
            )
        } else {
            await db.collection('mail').updateOne(
                { _id: mail._id },
                { $set: {
                    delivered: new Date(),
                    state: 'delivered'
                } }
            )
        }
    } catch(e) {
        console.log(e.message)
        if (e.message.includes('topology') || e.message.includes('pool')) {
            shutdown()
        }
    }
}

module.exports = function MailQueue(ctx, opts = {}) {
    const {
        interval = 5000,
        retry = 5
    } = opts

    let itvl = setInterval(() => executor(ctx, {retry}), interval)

    return {
        stop() {
            itvl = clearInterval(itvl)
        }
    }
}