const bcrypt = require('bcryptjs')

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

module.exports = { hashPassword }
