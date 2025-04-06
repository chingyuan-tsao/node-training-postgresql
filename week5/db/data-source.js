//這個是建立「連接資料庫」的設定檔，並透過 TypeORM 去幫你建立連線

//DataSource 是 TypeORM 的一個類別，用來建立與資料庫的連線。
const { DataSource } = require('typeorm')
const config = require('../config/index')


//每個 Entity 都對應到資料庫裡的一張表。（例如 User entity 就對應到 user table，裡面有 id, name, email… 等欄位）
//TypeORM 會根據這些 Entity，自動幫你對應(mapping)到資料庫。
const CreditPackage = require('../entities/CreditPackages')
const Skill = require('../entities/Skill')
const User = require('../entities/User')
const Coach = require('../entities/Coach')
const Course = require('../entities/Course')

//建立一個新的資料庫連線，並且定義連線設定
const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  poolSize: 10,
  entities: [ //	告訴 TypeORM：要使用哪些 Entity 檔案去對應 table
    CreditPackage,
    Skill,
    Coach,
    Course,
    User
  ],
  ssl: config.get('db.ssl')
})

//把 dataSource 物件 export 出去
module.exports = { dataSource }



// 超白話總結
// 這個 data-source.js 就是在幫 TypeORM 建立資料庫連線設定，並且準備好連線池（pool），最後 export 出去給其他地方用。
// 它會用 config.get() 抓 .env 裡的設定，把資料庫 host、port、使用者、密碼、資料庫名稱都丟給 DataSource，再指定要用哪些 Entity，最終 dataSource.initialize() 執行後，整個系統就可以開始操作資料庫了