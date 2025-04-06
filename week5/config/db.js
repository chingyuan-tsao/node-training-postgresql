//這是資料庫設定檔

//它把所有資料庫連線需要的設定（主機位址、連線埠號、帳號密碼、資料庫名稱、是否同步、是否啟用 SSL）通通從環境變數 process.env 裡面拿出來，
// 然後包成一個物件 db 並 module.exports 出去。

// 為什麼要用環境變數？因為真正的密碼、連線資訊不要寫死在程式裡，而是透過 .env 或主機環境設定，這樣安全又方便。

module.exports = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: process.env.DB_ENABLE_SSL === 'true' ? { rejectUnauthorized: false } : false
}
