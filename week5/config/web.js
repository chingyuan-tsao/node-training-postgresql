//這是網站設定檔

module.exports = {
  logLevel: process.env.LOG_LEVEL || 'debug',
  port: process.env.PORT || 3000 //如果 process.env.PORT 沒有設定，就會是 3000
}
