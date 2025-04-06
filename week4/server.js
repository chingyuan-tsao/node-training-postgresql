//這份 server.js 主要是建立一個 Node.js HTTP 伺服器，並使用 TypeORM 來操作 PostgreSQL 資料庫

//引入必要的模組
//dotenv：用來載入 .env 檔案中的環境變數（如 PORT）。
//http：內建的 HTTP 伺服器模組，用來處理網路請求。
//AppDataSource：從 db.js 匯入 TypeORM 的資料庫連線設定。
require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")

//定義一些資料驗證函式 (檢查 API 傳入的資料是否符合格式)，目的是 確保 API 接收到的資料是有效的，避免錯誤或惡意輸入導致程式崩潰或資料庫異常

//定義一個名為 isUndefined 的函式，它接受一個參數 value
//isUndefined 的用途：這個函式主要用來 檢查一個變數是否[沒有被定義]
//應用在第87行，用來檢查前端傳來的資料是否缺少某個欄位
function isUndefined (value) { 
  // 檢查傳入的 value 是否等於 undefined。
  // 如果 value 確實是 undefined，函式會回傳 true。
  // 如果 value 不是 undefined（例如是數字、字串、物件等），函式會回傳 false。
  return value === undefined
}
//isNotValidSting 的用途：這個函式主要用來 檢查一個變數是否是[無效的字串]
function isNotValidSting (value) {
  // typeof value !== "string" >> value資料類型不是字串
  // value.trim().length === 0 >> trim() 會去掉字串開頭和結尾的空白，然後 .length === 0 檢查字串是否是空的。例如 " "（全是空白）會被 trim() 變成 ""，然後長度變成 0，所以這個條件為 true。
  // value === "" >> 直接檢查 value 是否是空字串 ""。這牆時已經包含在 value.trim().length === 0，所以可以省略。
  return typeof value !== "string" || value.trim().length === 0 || value === ""
}
//isNotValidInteger 的用途：這個函式主要用來 檢查一個變數是否是[無效的正整數]
function isNotValidInteger (value) {
  //value % 1 會檢查 value 是否是整數
  return typeof value !== "number" || value < 0 || value % 1 !== 0
}

//建立 HTTP 伺服器的請求處理函式
//這是一個 請求處理函式，根據 req.url（請求的網址）和 req.method（請求方法）來執行不同的 API 操作
const requestListener = async (req, res) => {
  //以下是api可跨網域請求，也可透過安裝 npm install cors express --save 
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
  }
  
  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  //處理 GET /api/credit-package (顯示資料)
  //判斷目前的 HTTP 請求是否符合兩個條件：
  //1.請求的 URL 是 /api/credit-package  
  //2.請求方法是 GET
  //如果符合，就進入處理 GET 請求的邏輯
  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      //AppDataSource 資料庫來源
      //使用 getRepository("CreditPackage") 取得 CreditPackage 資料表
      //find 顯示/選取 id, name, credit_amount, price
      const packages = await AppDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"]
      })
      res.writeHead(200, headers)
      res.write(JSON.stringify({ //回傳 JSON 格式的資料
        status: "success",
        data: packages
      }))
      res.end()
    } catch (error) {
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } 
  //處理 POST /api/credit-package (新增資料)
  else if (req.url === "/api/credit-package" && req.method === "POST") {
    //是在等 req（請求）中的資料傳送完畢後執行
    //這樣可以確保 資料完全接收到 才進行後續處理
    req.on("end", async () => {
      try {
        //body 是從請求中收到的原始資料
        //使用 JSON.parse() 將資料從字串格式轉換為 JavaScript 物件
        const data = JSON.parse(body)

        //第88~125行是防呆機制

        //(1)檢查收到的資料是否符合要求。任何一項驗證失敗，代表資料無效，進入錯誤處理
        if (isUndefined(data.name) || isNotValidSting(data.name) ||
                isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
                isUndefined(data.price) || isNotValidInteger(data.price)) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end()
          return
        }

        //(2)檢查資料是否已存在
        //透過 AppDataSource.getRepository("CreditPackage") 取得 CreditPackage 的資料庫 repository，這樣就可以進行資料庫操作。
        const creditPackageRepo = await AppDataSource.getRepository("CreditPackage")
        //使用 find 查詢資料庫，檢查是否已經有相同 name 的資料
        //find() 方法會回傳一個陣列 existPackage：
        //如果資料庫中有一筆或多筆資料的 name 跟 data.name 一樣，則 existPackage 會包含這些資料。
        //如果資料庫中沒有任何一筆資料的 name 和 data.name 一樣，則 existPackage 會是空陣列。
        const existPackage = await creditPackageRepo.find({
          //where查詢條件：name 欄位的值必須等於 data.name
          where: {
            name: data.name
          }
        })

        //代表資料庫有一樣的資料
        if (existPackage.length > 0) { 
          res.writeHead(409, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }))
          res.end()
          return
        }

        //建立並存入新資料
        const newPackage = await creditPackageRepo.create({
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        })
        const result = await creditPackageRepo.save(newPackage)
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end()
      } catch (error) {
        console.error(error)
        res.writeHead(500, headers)
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤"
        }))
        res.end()
      }
    })
  } 
  //處理 DELETE /api/credit-package/:id (刪除資料)
  else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try {
      //取得ID
      //split("/") >> 根據 / 做切割
      //pop() >> 只取出最後一段
      const packageId = req.url.split("/").pop()

      //檢查 id 是否有效
      if (isUndefined(packageId) || isNotValidSting(packageId)) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }

      //執行刪除
      //delete() 方法會回傳一個結果物件(result)
      const result = await AppDataSource.getRepository("CreditPackage").delete(packageId)
      
      //檢查是否刪除成功
      //result.affected 代表了實際刪除的資料筆數 (affected是result的一個屬性)
      //若 affected 是 0，則表示刪除沒有作用，可能是 packageId 不存在或不正確
      if (result.affected === 0) {     
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success"
      }))
      res.end()
    } catch (error) {
      console.error(error)
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } 

  //處理 GET /api/coaches/skill (顯示資料)
  else if (req.url === "/api/coaches/skill" && req.method === "GET") {
    try {
      const skill = await AppDataSource.getRepository("Skill").find({
        select: ["id", "name"]
      })
      res.writeHead(200, headers)
      res.write(JSON.stringify({ 
        status: "success",
        data: skill
      }))
      res.end()
    } catch (error) {
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } 
  //處理 POST /api/coaches/skill (新增資料)
  else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body)

        if (isUndefined(data.name) || isNotValidSting(data.name)) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end()
          return
        }

        const skillRepo = await AppDataSource.getRepository("Skill")
        const existSkill = await skillRepo.find({
          where: {
            name: data.name
          }
        })

        if (existSkill.length > 0) { 
          res.writeHead(409, headers)
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }))
          res.end()
          return
        }

        const newSkill = await skillRepo.create({
          name: data.name,
        })
        const result = await skillRepo.save(newSkill)
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end()
      } catch (error) {
        console.error(error)
        res.writeHead(500, headers)
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤"
        }))
        res.end()
      }
    })
  }
  //處理 DELETE /api/coaches/skill/:id (刪除資料)
  else if (req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE") {
    try {
      const skillId = req.url.split("/").pop()

      if (isUndefined(skillId) || isNotValidSting(skillId)) {
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }

      const result = await AppDataSource.getRepository("Skill").delete(skillId)
      
      if (result.affected === 0) {     
        res.writeHead(400, headers)
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end()
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success"
      }))
      res.end()
    } catch (error) {
      console.error(error)
      res.writeHead(500, headers)
      res.write(JSON.stringify({
        status: "error",
        message: "伺服器錯誤"
      }))
      res.end()
    }
  } 

  //這是為了 處理 CORS 預檢請求（Preflight Request），讓瀏覽器允許跨來源存取 API
  else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } 
  //處理 404（找不到路由）
  //如果使用者請求的網址不在上面的 API 之中，就回傳 404 - 無此路由
  else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: "failed",
      message: "無此網站路由"
    }))
    res.end()
  }
}

//建立並啟動 HTTP 伺服器
//這行程式碼 建立 HTTP 伺服器，並指定 requestListener 處理請求
const server = http.createServer(requestListener)

//啟動伺服器
//1.初始化資料庫連線
//2.啟動伺服器，監聽 PORT（從 .env 讀取）
//3.輸出成功訊息
async function startServer () {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

//讓其他檔案可以 require('./server.js') 來啟動伺服器
module.exports = startServer();

//總結
// 1.這個 server.js 是一個 API 伺服器，處理 /api/credit-package 相關的 GET、POST、DELETE 請求。
// 2.透過 TypeORM 連接 PostgreSQL 資料庫。
// 3.支援 CORS，允許前端存取。
// 4.具備資料驗證，確保輸入正確。
// 5.處理錯誤（400, 404, 500）以提高 API 穩定性。