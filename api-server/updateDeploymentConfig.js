const { updateDeploymentStatus } = require("./Controllers/deploymentController/deploymentRepository");
const kafka = require("./kafkaConfig");

const consumer = kafka.consumer({groupId: "deployment-update-consumer"})

const updateDeployment = async()=>{
    await consumer.connect()
    await consumer.subscribe({topic:"deployment-update"})
    await consumer.run({
        autoCommit: false,
        eachBatch: async function ({batch, heartbeat, commitOffsetsIfNecessary, resolveOffset}) {
            const messages = batch.messages
            console.log(`Received ${messages.length} messages..`)
            for(const message of messages){
                const stringMsg = message.value.toString()
                const {PROJECT_ID, DEPLOYEMENT_ID, status} = JSON.parse(stringMsg)
                try {
                    const deployment = await updateDeploymentStatus(DEPLOYEMENT_ID, status)
                    console.log(deployment);
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

module.exports = updateDeployment