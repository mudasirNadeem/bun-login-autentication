import { Database } from "bun:sqlite";
import login from "./index.html";
import signup from "./sign-up.html";
import dashboard from "./dashboard.html";
import customerstable from "./customer-table.html";
import product from "./product.html";
import discount from "./discount.html";
import pos from "./pos.html";
import sale from "./sale.html";
var db = new Database("userLogin.db");
db.query(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT)`
).run();
db.query(
  `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      customerType TEXT)`
).run();
db.query(
  `
    CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      picture TEXT,
      productName TEXT,
      price  TEXT)`
).run();
db.query(
  `
    CREATE TABLE IF NOT EXISTS discount (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      customerId INTEGER,
      userName Text,
      discount TEXt)`
).run();

db.query(
  `CREATE TABLE IF NOT EXISTS saleItems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  customerId INTEGER,
  customer TEXT,
  productName TEXT,
  discount TEXT,
  price TEXT,
  quantity INTEGER,
  totalPrice INTEGER,
  saleDate TEXT,
  orderID INTEGER
);  `
).run();

db.query(
  `CREATE TABLE IF NOT EXISTS orderIdTable (
  id INTEGER PRIMARY KEY AUTOINCREMENT);  `
).run();
Bun.serve({
  static: {
    "/": login,
    "/signup": signup,
    "/dashboard": dashboard,
    "/customerstable": customerstable,
    "/product": product,
    "/discount": discount,
    "/pos": pos,
    "/sale": sale,
  },
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname == "/api/login" && req.method === "POST") {
      const { username, password } = await req.json();

      var user = db
        .query(
          `SELECT id, username, password FROM users WHERE username = ? AND password = ?`
        )
        .get(username, password);
      if (user) {
        return Response.json({ ok: true, user });
      } else {
        return Response.json({ ok: false, user });
      }
    } else if (url.pathname == "/api/signup" && req.method === "POST") {
      const { username, password } = await req.json();

      var user = db
        .query(
          `SELECT id, username, password FROM users WHERE username = ? AND password = ?`
        )
        .get(username, password);
      if (user) {
        return Response.json({ ok: true, user });
      } else {
        db.query(`INSERT INTO users (username, password) VALUES (?, ?)`).run(
          username,
          password
        );
        var user = db
          .query(
            `SELECT id, username, password FROM users WHERE username = ? AND password = ?`
          )
          .get(username, password);
        return Response.json({ ok: false, user });
      }
    } else if (url.pathname == "/api/customerForm" && req.method == "POST") {
      const { name, email, phone, address, customerType, userId } =
        await req.json();
      try {
        var user = db
          .query(
            `SELECT id, email, userId FROM Customers WHERE email = ? AND userId = ?`
          )
          .get(email, userId);
        if (user) {
          return Response.json({ ok: false, error: error });
        }
        db.query(
          `INSERT INTO customers (name, email, phone, address, customerType,userId) VALUES (?, ?,?,?,?,?)`
        ).run(name, email, phone, address, customerType, userId);
        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/customerTable" && req.method == "POST") {
      try {
        const { userId } = await req.json();

        const rows = db
          .query("SELECT * FROM customers where userId = ?")
          .all(userId);
        if (rows) {
          return Response.json({ ok: true, customers: rows });
        }
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/cutomerDelete" && req.method == "DELETE") {
      const { id } = await req.json();
      db.query(`DELETE FROM Customers WHERE id = ?;`).run(id);
      return Response.json({ ok: true });
    } else if (
      url.pathname === "/api/customerEditForm" &&
      req.method === "PUT"
    ) {
      try {
        const { id, name, email, phone, address, customerType } =
          await req.json();

        db.query(
          `UPDATE Customers 
             SET name = ?, email = ? , phone = ?, address = ?, customerType = ? WHERE id = ?;`
        ).run(name, email, phone, address, customerType, id);
        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    } else if (url.pathname === "/api/product" && req.method === "POST") {
      try {
        const { id, productImage, productName, price } = await req.json();
        db.query(
          `INSERT INTO product (userId , picture, productName, price) VALUES (?, ?,?,?)`
        ).run(id, productImage, productName, price);

        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    } else if (url.pathname === "/api/productsTable" && req.method === "POST") {
      try {
        const { userId } = await req.json();
        const rows = db
          .query("SELECT * FROM product WhERE userId = ?")
          .all(userId);

        if (rows) {
          return Response.json({ ok: true, product: rows });
        }
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    } else if (url.pathname == "/api/productDelete" && req.method == "DELETE") {
      try {
        const { id } = await req.json();
        db.query(`DELETE FROM product WHERE id = ?;`).run(id);
        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    } else if (url.pathname === "/api/editProduct" && req.method === "PUT") {
      try {
        const { id, productName, price } = await req.json();

        db.query(
          `UPDATE product 
             SET productName = ?,  price = ? WHERE id = ?;`
        ).run(productName, price, id);
        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    } else if (url.pathname == "/api/showCustomers" && req.method == "POST") {
      try {
        const { userId } = await req.json();
        const rows = db
          .query("SELECT * FROM customers WHERE UserId = ?")
          .all(userId);
          const discountRows = db
          .query(
            `SELECT customers.name, discount.discount, discount.id 
             FROM customers 
             INNER JOIN discount ON customers.id = discount.customerId 
             WHERE discount.UserId = ?`
          )
          .all(userId);
        if (rows) {
          return Response.json({
            ok: true,
            customers: rows,
            discount: discountRows,
          });
        }
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/discount" && req.method == "POST") {
      try {
        const { userId, userName, customerId, discount } = await req.json();
        var findUser = db
          .query(`SELECT * From discount  WHERE userName = ? AND userId = ?`)
          .get(userName , userId);
        if (findUser) {
          return Response.json({ ok: false });
        } else {
          var discountRow = db
            .query(
              `INSERT INTO discount (userId , userName,  customerId ,  discount) VALUES (?,?,?,?)`
            )
            .run(userId, userName, customerId, discount);
          return Response.json({ ok: true });
        }
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/discountEdit" && req.method == "POST") {
      try {
        const { id } = await req.json();
        const rows = db.query("SELECT * FROM discount where id = ?").all(id);
        return Response.json({ ok: true, discount: rows });
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/discount" && req.method == "PUT") {
      try {
        const { id, discount } = await req.json();
        const rows = db
          .query(
            `UPDATE discount 
          SET  discount = ? WHERE id = ?`
          )
          .run(discount, id);
        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (
      url.pathname == "/api/discountDelete" &&
      req.method == "DELETE"
    ) {
      const { id } = await req.json();
      db.query(`DELETE FROM discount WHERE id = ?;`).run(id);
      return Response.json({ ok: true });
    } else if (url.pathname == "/api/showProduct" && req.method == "POST") {
      try {
        const { userId } = await req.json();
        var getProduct = db
          .query(`SELECT * FROM product WHERE userId = ?`)
          .all(userId);
        return Response.json({ ok: true, getProduct });
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/cartView" && req.method == "POST") {
      try {
        const { id } = await req.json();
        var product = db.query(`SELECT * FROM product WHERE id = ?`).all(id);
        return Response.json({ ok: true, product });
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/addDiscountToCustomer" && req.method == "POST") {
      try {
        const { userName , userId } = await req.json();
        var discount = db
          .query(`SELECT * FROM discount WHERE userName = ? AND userId = ?`)
          .all(userName , userId);
        return Response.json({ ok: true, discount });
      } catch (error) {
        return Response.json({ ok: false, error: error });
      }
    } else if (url.pathname == "/api/saleItemsTable" && req.method == "POST") {
      try {
        const { name, price, quantity, totalRupes, date, user , discount , userID} = await req.json();
        const customer = db.prepare(`SELECT id FROM customers WHERE email = ?`).get(user);
        const latestOrder = db.prepare("SELECT id FROM orderIdTable ORDER BY id DESC LIMIT 1").get();
        const orderID = latestOrder?.id;
          var customerId;
          if(!customer){
            customerId = 0;
          }
          else{
            customerId = customer.id;
          }
        db.prepare(`INSERT INTO saleItems (customerId,productName,price,quantity,totalPrice,saleDate,customer,discount,userId,orderID) VALUES (?, ?, ?, ?, ?, ?, ?, ? , ? , ?)`).run(customerId,name,price,quantity,totalRupes,date,user,discount,userID, orderID);
        return Response.json({ok: true,message: "Sale item inserted successfully."});
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }
    

    else if (url.pathname == "/api/selectSaleCustomer" && req.method == "POST") {
      try {
        const {userId} = await req.json();
        var selectCustomer = db
          .query(`SELECT * FROM saleItems WHERE userId = ?`).all(userId);
        return Response.json({ ok: true, customers :  selectCustomer});
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }

    else if (url.pathname == "/api/chooseUSer" && req.method == "POST") {
      try {
        const { userId, user } = await req.json();
        if(user == "All Customer"){
          const selectCustomer = db
          .prepare(`SELECT * FROM saleItems WHERE userId = ?`)
          .all(userId);
          return Response.json({ ok: true, customers :  selectCustomer});
        }
        else{

        const selectCustomer = db
          .prepare(`SELECT * FROM saleItems WHERE userId = ? AND customer = ?`)
          .all(userId, user);
        return Response.json({ ok: true, customers :  selectCustomer});

        }
        
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }


    else if (url.pathname == "/api/generateOrderID" && req.method == "POST") {
      try {
        const orderResult = db
        .prepare("INSERT INTO orderIdTable DEFAULT VALUES")
        .run();      
        return Response.json({ ok: true, customers :  orderResult});
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }
    else if (url.pathname == "/api/customerOrderId" && req.method == "POST") {
      try {
        const { orderId } = await req.json();
        var currentOrder = db
          .query(`SELECT * FROM saleItems WHERE orderID = ?`).all(orderId);
        return Response.json({ ok: true, customers :  currentOrder});
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }
  },
});
