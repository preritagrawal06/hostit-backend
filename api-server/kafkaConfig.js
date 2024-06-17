const {Kafka} = require('kafkajs')
const fs = require('fs')
const path = require('path')

const kafka = new Kafka({
    clientId: `api-server`,
    brokers:[process.env.KAFKA_BROKER],
    ssl:{
        ca:[fs.readFileSync(path.join(__dirname, 'kafka.pem'), 'utf-8')]
    },
    sasl:{
        username: process.env.KAFKA_USER,
        password: process.env.KAFKA_PASSWORD,
        mechanism:"plain"
    }
})

module.exports = kafka