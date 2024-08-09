const express = require('express')
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


const app = express()
app.options('*', cors());
app.use(cors({
    origin: ["http://localhost:5173", "https://hostit-frontend.vercel.app", "https://hostit.preritagrawal.in"]
}))
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(express.json())
  
const PORT = process.env.PORT || 9000

const projectRouter = require('./Routers/project.routes')
app.use('/api/v1', projectRouter)
const userRouter = require('./Routers/user.routes')
app.use('/api/v1/user', userRouter)

const initKafkaConsumer = async()=>{
    try {
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
    } catch (error) {
        console.log(error.message);
    }
}


initKafkaConsumer()
updateDeployment()


// io.listen(9002, ()=>{console.log('socket server running on port: 9002')})
app.listen(PORT, ()=>{console.log(`api-server running on port: ${PORT}`)})
