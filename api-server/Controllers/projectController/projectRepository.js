const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient({})

const getProjectByUserId = async(userId)=>{
    const projects = await prisma.project.findMany({where:{userId: userId}})
    return projects
}

const getProjectById = async(projectId)=>{
    const projects = await prisma.project.findFirst({where:{id: projectId}})
    return projects
}

module.exports = {getProjectByUserId, getProjectById}