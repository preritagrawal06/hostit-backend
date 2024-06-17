const jwt = require('jsonwebtoken')
const { getUserById } = require('../Controllers/userController/userRepository')

const authMiddleware = async(req, res, next)=>{
    
    try {
        const { authorization } = req.headers
        if(!authorization){
            return res.json({
                success: false,
                message: "Auth token required"
            })
        }
        // console.log(authorization);
        if(authorization.split(' ')[0] !== "Bearer"){
            return res.json({
                success:false,
                message: 'Unauthorized access'
            })
        }
    
        const token = authorization.split(" ")[1]
        const user = jwt.verify(token, "valarmorghulis")
        req.user = await getUserById(user.id)
        next()
    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: "invalid auth token. Something went  wrong"
        })
    }
}

module.exports = authMiddleware