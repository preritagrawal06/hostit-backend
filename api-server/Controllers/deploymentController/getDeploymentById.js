const { getDeploymentById } = require("./deploymentRepository")

const getDeploymentByDeploymentId = async(req, res, next)=>{
    const {deploymentId} = await req.params
    const deployment = await getDeploymentById(deploymentId)

    return res.json({
        success: true,
        deployment
    })
}

module.exports = getDeploymentByDeploymentId