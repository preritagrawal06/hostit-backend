const app = require('express')
// const ecsController = require('../Controllers/ecsController')
const addProject = require('../Controllers/projectController/addProject')
const addDeployment = require('../Controllers/deploymentController/addDeployments')
const getLogs = require('../Controllers/deploymentController/getLogs')
const authMiddleware = require('../middlewares/authMiddleware')
const getProjects = require('../Controllers/projectController/getProjects')
const getProject = require('../Controllers/projectController/getProject')
const getDeployments = require('../Controllers/deploymentController/getDeployments')
const getDeployment = require('../Controllers/deploymentController/getDeployment')
const getDeploymentByDeploymentId = require('../Controllers/deploymentController/getDeploymentById')

const router = app.Router()

router.post('/project', authMiddleware, addProject)
router.get('/project/getall', authMiddleware, getProjects)
router.post('/project/getone', authMiddleware, getProject)
router.post('/project/deployments', authMiddleware, getDeployments)
router.post('/project/deployment', authMiddleware, getDeployment)
router.get('/project/deployment/:deploymentId', authMiddleware, getDeploymentByDeploymentId)
router.post('/deploy', authMiddleware, addDeployment);
router.get('/logs/:id', authMiddleware, getLogs)
module.exports = router
