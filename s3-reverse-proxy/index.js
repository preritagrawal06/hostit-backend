const express = require('express')
const httpProxy = require('http-proxy')
require('dotenv').config()
const PORT = 8000
const app = express()
const proxy = httpProxy.createProxy()

const pathRedirect = (req, res, next)=>{
    const hostname = req.hostname
    const subdomain = hostname.split('.')[0]

    const resolveTo = `${process.env.BASE_PATH}/${subdomain}`

    return proxy.web(req, res, {target: resolveTo, changeOrigin: true})
}

proxy.on('proxyReq', (proxyReq, req, res)=>{
    const url = req.url
    if(url === '/') proxyReq.path += 'index.html'
})

app.use(pathRedirect)

app.listen(PORT, ()=>{console.log( `Reverse proxy running on PORT: ${PORT}`)})