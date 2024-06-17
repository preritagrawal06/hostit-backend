const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient({})

const getUserById = async(userId)=>{
    const user = await prisma.user.findUnique({where:{id: userId}})
    return user
}

const getUserByEmail = async(userEmail)=>{
    const user = await prisma.user.findFirst({where:{email: userEmail}})
    return user
}

const createUser = async(email, username, password)=>{
    const user = await prisma.user.create({
        data:{
            email,
            username,
            password,
        }
    })

    return user
}

module.exports = {getUserByEmail, getUserById, createUser}