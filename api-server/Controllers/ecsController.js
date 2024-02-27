
const {generateSlug} = require('random-word-slugs')
const {ECSClient, RunTaskCommand} = require('@aws-sdk/client-ecs')

const ecsClient = new ECSClient({
    region: process.env.REGION,
    credentials:{
        accessKeyId: process.env.ACCESS_ID,
        secretAccessKey: process.env.ACCESS_KEY
    }
})

const ecsController = async (req, res)=>{
    const {gitUrl, slug} = req.body
    const projectSlug = slug ? slug : generateSlug()

    const command = new RunTaskCommand({
        cluster: process.env.CLUSTER,
        taskDefinition: process.env.TASK,
        count: 1,
        launchType: 'FARGATE',
        networkConfiguration:{
            awsvpcConfiguration:{
                subnets:['subnet-0abb25156fc700b06', 'subnet-0a20bc1ca400490b8', 'subnet-0a1a52fda660f06a0'],
                securityGroups:['sg-0c66d43d1b35a718b'],
                assignPublicIp: 'ENABLED'
            }
        },
        overrides:{
            containerOverrides:[{
                name: process.env.IMAGE_NAME,
                environment:[
                    {
                        name:'GIT_REPOSITORY_URL',
                        value: gitUrl
                    },
                    {
                        name:'PROJECT_ID',
                        value: projectSlug
                    }
                ]
            }]
        }
    })

    await ecsClient.send(command)

    return res.json({
        status: 'queued',
        data:{
            projectSlug,
            url: `http://${projectSlug}.localhost:8000`
        }
    })
}

module.exports = ecsController