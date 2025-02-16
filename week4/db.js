//這段 db.js 主要是使用 TypeORM 來設定 PostgreSQL 資料庫的連線與資料表結構

//引入 TypeORM 模組
// DataSource：用來設定並連接資料庫
// EntitySchema：用來定義資料庫的資料表（Table）結構
const { DataSource, EntitySchema } = require("typeorm")

//定義 CreditPackage 資料表
const CreditPackage = new EntitySchema({
  name: "CreditPackage", // 資料表的名稱（ORM 內部使用）
  tableName: "CREDIT_PACKAGE", // 真正在資料庫內的表名
  columns: {
    id: {
      primary: true, // 設定為主鍵
      type: "uuid",
      generated: "uuid", // 讓資料庫自動產生 UUID
      nullable: false // 不能為空
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true // 名稱是唯一的
    },
    credit_amount: {
      type: "integer",
      nullable: false
    },
    price: {
      type: "numeric",
      precision: 10,
      scale: 2, // 小數點後 2 位
      nullable: false
    },
    createdAt: {
      type: "timestamp", // 時間戳記類型
      createDate: true, // 自動填入建立時間
      name: "created_at", // 資料庫內的欄位名稱
      nullable: false
    }
  }
})

//定義 Skill 資料表
const Skill = new EntitySchema({
  name: "Skill",
  tableName: "SKILL",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      name: "created_at",
      nullable: false
    }
  }
})

//設定資料庫連線
// process.env.DB_HOST 等環境變數允許開發者在不同環境下使用不同的資料庫設定
// entities 陣列讓 TypeORM 知道要管理哪些表
// synchronize: true 會讓 TypeORM 自動建立或更新資料表結構（⚠️ 正式環境通常會關閉，避免意外變更資料表）
const AppDataSource = new DataSource({
  type: "postgres", // 指定資料庫類型（PostgreSQL）
  host: process.env.DB_HOST || "localhost", // 資料庫伺服器的 IP 或網址
  port: process.env.DB_PORT || 5432, // PostgreSQL 預設的埠號
  username: process.env.DB_USERNAME || "testHexschool", // 連線用的帳號
  password: process.env.DB_PASSWORD || "pgStartkit4test", // 連線用的密碼
  database: process.env.DB_DATABASE || "test", // 連線的資料庫名稱
  entities: [CreditPackage, Skill], // 設定要使用的資料表
  synchronize: true // 啟動時自動同步資料表結構（⚠️ 上線時建議關閉）
})


// 透過 entities 陣列將所有 EntitySchema 加入。
// 啟動時 TypeORM 會根據這些設定自動建立或更新表結構（若 synchronize: true）。
// 之後就能使用 AppDataSource.getRepository("CreditPackage") 或 AppDataSource.getRepository("Skill") 進行 CRUD。


//匯出 AppDataSource
//這樣其他檔案就可以 require('./db.js') 來存取 AppDataSource，並透過 getRepository 來對 CreditPackage 和 Skill 這兩個表進行 CRUD（增刪查改）操作
module.exports = AppDataSource


// 總結
// 這份 db.js 主要功能：
// 1.定義資料表：使用 EntitySchema 建立 CreditPackage 和 Skill 表。
// 2.連接資料庫：用 DataSource 設定 PostgreSQL 連線資訊。
// 3.提供 CRUD 操作：可以透過 AppDataSource.getRepository("表名") 來查詢、插入、更新或刪除資料。