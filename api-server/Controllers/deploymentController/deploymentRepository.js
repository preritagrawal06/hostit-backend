const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient({})

const getDeploymentsByProjectId = async(projectId) => {
    const deployments = await prisma.deployement.findMany({where: {projectId: projectId}})
    return deployments
}

const getDeploymentById = async(deploymentId) => {
    const deployment = await prisma.deployement.findFirst({where: {id: deploymentId}})
    return deployment
}

const getDeploymentByQuery = async(query) => {
    const deployment = await prisma.deployement.findFirst({where: query})
    return deployment
}

const updateDeploymentStatus = async(deploymentId, status) => {
    const deployment = await prisma.deployement.update({where:{id: deploymentId}, data:{status: status}})
    return deployment
}

module.exports = {getDeploymentsByProjectId, getDeploymentByQuery, updateDeploymentStatus, getDeploymentById}