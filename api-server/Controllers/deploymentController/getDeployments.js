const { getDeploymentsByProjectId } = require("./deploymentRepository")

const getDeployments = async(req, res, next)=>{
    const {projectId} = await req.body
    const deployments = await getDeploymentsByProjectId(projectId)

    if(deployments.length > 0){
        return res.json({
            success: true,
            deployments
        })
    }
    return res.json({
        success: false,
        message: "No deployments found for this project",
        deployments
    })
}

module.exports = getDeployments