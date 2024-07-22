const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const mime = require('mime-types')
require('dotenv').config()
const {Kafka} = require('kafkajs')

const kafka = new Kafka({
    clientId: `docker-build-server-${process.env.DEPLOYEMENT_ID}`,
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

const producer = kafka.producer()

const s3Client = new S3Client({
    region:process.env.REGION,
    credentials:{
        accessKeyId:process.env.ACCESS_ID,
        secretAccessKey:process.env.ACCESS_KEY
    }
})

const PROJECT_ID = process.env.PROJECT_ID
const DEPLOYEMENT_ID = process.env.DEPLOYEMENT_ID

const publishLog = async (log)=>{
    await producer.send({topic:"container-logs", messages:[{key:"logs", value: JSON.stringify({PROJECT_ID, DEPLOYEMENT_ID, log})}]})
}

const updateDeployment = async(status)=>{
    await producer.send({topic:"deployment-update", messages:[{key: "update", value: JSON.stringify({PROJECT_ID, DEPLOYEMENT_ID, status})}]})
}

async function init(){
    await producer.connect()
    console.log('Executing script.js....')
    await publishLog('Build Started...')
    const outDirPath = path.join(__dirname, 'output')
    const p = process.env.pkgmngr === "npm" ? exec(`cd ${outDirPath} && npm install && npm run build`) : exec(`cd ${outDirPath} && npm install --global yarn && yarn install && yarn run build`)

    p.stdout.on('data', async (data)=>{
        console.log(data.toString())
        await publishLog(data.toString())
    })

    p.stdout.on('error', async (data)=>{
        console.log('error:', data.toString())
        await publishLog(`error: ${data.toString()}`)
        await updateDeployment("FAIL")
    })

    p.on('close', async ()=>{
        await publishLog("Build complete...")
        console.log("Build complete")
        const distDirPath = process.env.directory.length > 0 ? path.join(__dirname, 'output', process.env.directory) : path.join(__dirname, 'output');
        const distDirContents = fs.readdirSync(distDirPath, {recursive: true}) //recursive true traverse the sub folders to find the files

        await publishLog("Starting to upload to bucket...")
        for(const file of distDirContents){

            const filePath = path.join(distDirPath, file)

            if(fs.lstatSync(filePath).isDirectory()) continue;

            console.log("Uploading ", filePath);
            await publishLog(`Uploading ${file}`)
            
            const command = new PutObjectCommand({
                Bucket:'hostit-outputs-new',
                Key:`__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })

            await s3Client.send(command)

            console.log("Uploaded ", filePath)
            await publishLog(`Uploaded ${file}`)
        }
        console.log('done..')
        await publishLog("Done...")
        await updateDeployment("READY")
        process.exit(0)
    })
}

init()