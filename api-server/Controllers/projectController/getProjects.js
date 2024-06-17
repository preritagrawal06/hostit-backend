const { getProjectByUserId } = require("./projectRepository")

const getProjects = async(req, res, next)=>{
    const {id} = req.user
    const projects = await getProjectByUserId(id)
    if(projects){
        return res.json({
            success: true,
            projects
        })
    }
    return res.json({
        success: false,
        message: "No projects found"
    })
}

module.exports = getProjects