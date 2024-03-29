const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const mime = require('mime-types')
const Redis = require('ioredis')
require('dotenv').config()


const publisher = new Redis(process.env.REDIS_URI)

const s3Client = new S3Client({
    region:process.env.REGION,
    credentials:{
        accessKeyId:process.env.ACCESS_ID,
        secretAccessKey:process.env.ACCESS_KEY
    }
})

const PROJECT_ID = process.env.PROJECT_ID

const publishLog = (log)=>{
    publisher.publish(`log:${PROJECT_ID}`, JSON.stringify({log}))   
}

async function init(){
    console.log('Executing script.js....')
    publishLog('Build Started...')
    const outDirPath = path.join(__dirname, 'output')
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', (data)=>{
        console.log(data.toString())
        publishLog(data.toString())
    })

    p.stdout.on('error', (data)=>{
        console.log('error:', data.toString())
        publishLog(`error: ${data.toString()}`)
    })

    p.on('close', async ()=>{
        publishLog("Build complete...")
        console.log("Build complete")
        const distDirPath = path.join(__dirname, 'output', 'dist');
        const distDirContents = fs.readdirSync(distDirPath, {recursive: true}) //recursive true traverse the sub folders to find the files

        publishLog("Starting to upload to bucket...")
        for(const file of distDirContents){

            const filePath = path.join(distDirPath, file)

            if(fs.lstatSync(filePath).isDirectory()) continue;

            console.log("Uploading ", filePath);
            publishLog(`Uploading ${file}`)
            
            const command = new PutObjectCommand({
                Bucket:'hostit-outputs',
                Key:`__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })

            await s3Client.send(command)

            console.log("Uploaded ", filePath)
            publishLog(`Uploaded ${file}`)
        }
        console.log('done..')
        publishLog("Done...")
    })
}

init()