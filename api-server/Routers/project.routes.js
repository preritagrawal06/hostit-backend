const app = require('express')
const ecsController = require('../Controllers/ecsController')
const router = app.Router()

router.post('/deploy', ecsController);

module.exports = router
