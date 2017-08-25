const Mailer = require('nodemailer')

module.exports = function createMailer({
    port = 465,
    host,
    account,
    password
}) {
    return Mailer.createTransport({
        host,
        port,
        secure: true,
        pool: true,
        auth: {
            user: account,
            pass: password
        }
    })
}