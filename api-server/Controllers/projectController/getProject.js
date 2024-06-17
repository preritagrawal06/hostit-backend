const { getProjectById } = require("./projectRepository")

const getProject = async(req, res, next)=>{
    const {projectId} = req.body
    const project = await getProjectById(projectId)
    if(project){
        return res.json({
            success: true,
            project
        })
    }
    return res.json({
        success: false,
        message: "No project found"
    })
}

module.exports = getProject