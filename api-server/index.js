const express = require('express')
const Redis = require('ioredis')
const {Server} = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const Subscriber = new Redis(process.env.REDIS_URI)

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

const initRedisSubscriber = async()=>{
    Subscriber.psubscribe('log:*')
    Subscriber.on('pmessage', (pattern, channel, message)=>{
        io.to(channel).emit('message', message)
    })
}

initRedisSubscriber()

io.listen(9002, ()=>{console.log('socket server running on port: 9002')})
app.listen(PORT, ()=>{console.log(`api-server running on port: ${PORT}`)})