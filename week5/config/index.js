//這是把 db.js 和 web.js 組合起來的檔案


// 為什麼 const dotenv = require('dotenv') 不是寫在 db.js 裡面？
// 因為：dotenv 只需要在「整個應用最早啟動的地方」執行一次就好！
// 一般來說「啟動點」就是 config/index.js（或 bin/www.js 這類入口檔）。一旦執行 dotenv.config()，整個 process.env 全域就有值了，之後任何地方 require('./db') 都可以用 process.env 拿到。
// 如果每個檔案都重複 require('dotenv')，會沒效率、不必要。所以只要在 index.js 一次就好。

const dotenv = require('dotenv')//載入 dotenv 模組，dotenv 會幫我們把 .env 檔案裡面的變數放到 process.env 裡。

const result = dotenv.config() //把 .env 檔案裡的所有 key-value，自動放到 process.env 裡面
const db = require('./db') //用物件方式引入 db.js，代表資料庫設定
const web = require('./web') //用物件方式引入 web.js，代表 web 設定

//如果 .env 檔案讀取失敗，就直接拋錯停止
if (result.error) {
  throw result.error
}

//用更大的物件 config 組合 db.js 和 web.js
const config = {
  db,
  web
}

class ConfigManager {
  /**
   * Retrieves a configuration value based on the provided dot-separated path.
   * Throws an error if the specified configuration path is not found.
   *
   * @param {string} path - Dot-separated string representing the configuration path.
   * @returns {*} - The configuration value corresponding to the given path.
   * @throws Will throw an error if the configuration path is not found.
   */

  static get (path) {
    if (!path || typeof path !== 'string') {
      throw new Error(`incorrect path: ${path}`)
    }
    const keys = path.split('.')
    let configValue = config
    keys.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(configValue, key)) {
        throw new Error(`config ${path} not found`)
      }
      configValue = configValue[key]
    })
    return configValue
  }
}

//把 ConfigManager 拋出
module.exports = ConfigManager
