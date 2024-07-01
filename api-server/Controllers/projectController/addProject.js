const { PrismaClient } = require('@prisma/client')
const { generateSlug } = require('random-word-slugs')
const {z} = require('zod')

const prisma = new PrismaClient({})

const addProject = async(req, res, next)=>{
    const schema = z.object({
        name: z.string(),
        gitUrl: z.string()
    })
    const safeParseResult = schema.safeParse(req.body)
    if(safeParseResult.error){
        console.log(safeParseResult.error);
        return res.json({
            success: false,
            message: "Please check your provided data!"
        })
    }

    const {name, gitUrl} = safeParseResult.data

    const userId = await req.user.id
    try {
        const project = await prisma.project.create({
            data:{
                name,
                gitURL: gitUrl,
                subDomain: generateSlug(),
                createdBy: {connect:{id: userId}}
            }
        })
    
        return res.status(200).json({
            success: true,
            message: "project created successfully",
            project
        })

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: "something went wrong"
        })
    }

}

module.exports = addProject