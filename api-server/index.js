const express = require('express')
const {Server} = require('socket.io')
const cors = require('cors')
require('dotenv').config()
const {v4: uuidv4} = require('uuid')
const kafka = require('./kafkaConfig')
const chClient = require('./clickHouseConfig')
const updateDeployment = require('./updateDeploymentConfig')

// console.log(process.env.KAFKA_USER);
// console.log(process.env.KAFKA_PASSWORD);
const healthCheck = async()=>{
    const result = await chClient.ping()
    console.log(result);
}

healthCheck()

const consumer = kafka.consumer({groupId: 'api-server-logs-consumer'})

io = new Server({cors:"*"})

io.on('connection', (socket)=>{
    socket.on('subscribe', channel=>{
        socket.join(channel)
        socket.emit('message', `joined ${channel}`)
    })
})

const app = express()
app.use(express.json())
app.use(cors())
const PORT = process.env.PORT || 9000

const projectRouter = require('./Routers/project.routes')
app.use('/api/v1', projectRouter)
const userRouter = require('./Routers/user.routes')
app.use('/api/v1/user', userRouter)

const initKafkaConsumer = async()=>{
    await consumer.connect()
    await consumer.subscribe({topic:"container-logs"})
    await consumer.run({
        autoCommit: false,
        eachBatch: async function ({batch, heartbeat, commitOffsetsIfNecessary, resolveOffset}) {
            const messages = batch.messages
            console.log(`Received ${messages.length} messages..`) 
            for(const message of messages){
                const stringMsg = message.value.toString()
                const {PROJECT_ID, DEPLOYEMENT_ID, log} = JSON.parse(stringMsg)
                try {
                    const {query_id} = await chClient.insert({
                        table:'log_events',
                        values: [{event_id: uuidv4(), deployment_id: DEPLOYEMENT_ID, log}],
                        format: 'JSONEachRow'
                    })
                    console.log(query_id);
                    resolveOffset(message.offset)
                    commitOffsetsIfNecessary(message.offset)
                    await heartbeat()
                } catch (error) {
                    console.log(err);
                }
            }
        }
    })
}

try {
    initKafkaConsumer()
    updateDeployment()
} catch (error) {
    console.log(error.message);
}

// io.listen(9002, ()=>{console.log('socket server running on port: 9002')})
app.listen(PORT, ()=>{console.log(`api-server running on port: ${PORT}`)})