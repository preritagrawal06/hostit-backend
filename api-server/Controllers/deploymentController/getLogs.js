const chClient = require('../../clickHouseConfig')

const getLogs = async(req, res, next)=>{
    const id = req.params.id
    try {
        const logs = await chClient.query({
            query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id: String}`,
            query_params:{
                deployment_id: id
            },
            format: "JSONEachRow"
        })
        const rawLogs = await logs.json()
        res.json({
            success: true,
            logs: rawLogs
        })
    } catch (error) {
        res.json({
            success: false,
            message: "Connection Error"
        })
    }
}

module.exports = getLogs