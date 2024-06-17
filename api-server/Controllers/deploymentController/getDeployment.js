const { getDeploymentByQuery } = require("./deploymentRepository")

const getDeployment = async(req, res, next)=>{
    const {projectId} = await req.body
    const deployment = await getDeploymentByQuery({projectId: projectId, status: "IN_PROGRESS"})

    return res.json({
        success: true,
        deployment
    })
}

module.exports = getDeployment