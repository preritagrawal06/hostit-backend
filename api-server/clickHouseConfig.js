const {createClient} = require('@clickhouse/client')

const chClient = createClient({
    url: process.env.CH_URL,
    database: process.env.CH_DB,
    username: process.env.CH_USER,
    password: process.env.CH_PASSWORD
})

module.exports = chClient   