const app = require('express')
const signupController = require('../Controllers/userController/signupController')
const loginController = require('../Controllers/userController/loginController')
const router = app.Router()

router.post('/signup', signupController)
router.post('/login', loginController)
router.post('/health', (req, res)=>{
    res.json({
        message: "everything is good!!"
    })
})
module.exports = router
