#!/usr/bin/env node

/**
 * Module dependencies.
 */

//這個通常是 Node.js 專案（特別是使用 Express 框架時）用來啟動伺服器的程式入口。

const http = require('http')
const config = require('../config/index') //只需要引入index，因為index已經包含 db 和 web  
const app = require('../app') // 導入 app.js
const logger = require('../utils/logger')('www') //是 www.js 這個檔案的 log 訊息
const { dataSource } = require('../db/data-source')

//會進到 config 裡的 web，然後取出 port 這個值
//config.get('web.port') 就等於「給我環境變數 PORT，如果沒有就 3000」
const port = config.get('web.port')

app.set('port', port)

const server = http.createServer(app)

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`
  // handle specific listen errors
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      logger.error(`exception on ${bind}: ${error.code}`)
      process.exit(1)
  }
}

server.on('error', onError)
server.listen(port, async () => {
  try {
    await dataSource.initialize() //正式建立資料庫連線
    logger.info('資料庫連線成功')
    logger.info(`伺服器運作中. port: ${port}`)
  } catch (error) {
    logger.error(`資料庫連線失敗: ${error.message}`)
    process.exit(1)
  }
})
