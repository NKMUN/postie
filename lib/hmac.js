const {createHmac} = require('crypto')

module.exports = function Hmac(alg = 'sha256', key = 'secret') {
    return data => {
        let hmac = createHmac(alg, key)
        hmac.update(data)
        return hmac.digest('hex')
    }
}
