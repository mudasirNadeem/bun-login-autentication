import { Database } from "bun:sqlite";
import login from "./index.html";
import signup from "./sign-up.html";
import dashboard from "./dashboard.html";
import customerstable from "./customer-table.html";
import product from "./product.html";
import discount from "./discount.html";


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
      email Text,
      discount TEXt)`
).run();

Bun.serve({
  static: {
    "/": login,
    "/signup": signup,
    "/dashboard": dashboard,
    "/customerstable": customerstable,
    "/product": product,
    "/discount" : discount
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
      const { name, email, phone, address, customerType,userId } = await req.json();
      try {
        var user = db
        .query(
          `SELECT id, email, userId FROM Customers WHERE email = ? AND userId = ?`
        )
        .get(email, userId);
        if(user){
          return Response.json({ ok: false,error: error });
        }
        db.query(
          `INSERT INTO customers (name, email, phone, address, customerType,userId) VALUES (?, ?,?,?,?,?)`
        ).run(name, email, phone, address, customerType,userId);
        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false,error: error });
      }
    }else if (url.pathname == "/api/customerTable" && req.method == "POST") {
      try {
      const { userId } = await req.json();

        const rows = db.query('SELECT * FROM customers where userId = ?').all(userId);
        if(rows){
          return Response.json({ ok: true , customers : rows});
        }
      } catch (error) {
        return Response.json({ ok: false,error: error });
      }
    }
    else if (url.pathname == "/api/cutomerDelete" && req.method == "DELETE") {
      const {id} = await req.json();
      db.query(`DELETE FROM Customers WHERE id = ?;`).run(id);
      return Response.json({ ok: true,  });
    }
    else if (url.pathname === "/api/customerEditForm" && req.method === "PUT") {
      try {
        const { id, name, email, phone, address, customerType } = await req.json();
       
          db.query(
            `UPDATE Customers 
             SET name = ?, email = ? , phone = ?, address = ?, customerType = ? WHERE id = ?;`
          ).run(name, email, phone, address, customerType , id);
          return Response.json({ ok: true });
    
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }
 
    else if (url.pathname === "/api/product" && req.method === "POST") {
      try {
        const { id, productImage, productName, price } = await req.json();
        db.query(
          `INSERT INTO product (userId , picture, productName, price) VALUES (?, ?,?,?)`
        ).run(id,productImage, productName, price);
      
          return Response.json({ ok: true });
    
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }
    else if (url.pathname === "/api/productsTable" && req.method === "POST") {
      try {
        const { userId } = await req.json();
        const rows = db.query('SELECT * FROM product WhERE userId = ?').all(userId);

        if(rows){
          return Response.json({ ok: true , product : rows});
        }
    
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }

    else if (url.pathname == "/api/productDelete" && req.method == "DELETE") {
      try {
        const {id} = await req.json();
        db.query(`DELETE FROM product WHERE id = ?;`).run(id);
        return Response.json({ ok: true,  });
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }

    }

    else if (url.pathname === "/api/editProduct" && req.method === "PUT") {
      try {
        const { id, productName , price } = await req.json();
       
          db.query(
            `UPDATE product 
             SET productName = ?,  price = ? WHERE id = ?;`
          ).run(productName, price, id);
          return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }
    else if (url.pathname == "/api/showCustomers" && req.method == "POST") {
      try {
        const rows = db.query('SELECT * FROM customers').all();
        const discountRows = db.query('SELECT * FROM discount').all();
        if(rows){
          return Response.json({ ok: true , customers : rows , discount : discountRows});
        }
      } catch (error) {
        return Response.json({ ok: false,error: error });
      }
    }

    else if (url.pathname == "/api/discount" && req.method == "POST") {
      try {
        const {userId , customerId , emailSelect , discount } = await req.json();
        const customersRows = db.query('SELECT * FROM customers where userId = ?').all(userId);
        var customer = db.query('SELECT * FROM customers where email = ?').all(emailSelect);
        var discountRow = db.query(  `INSERT INTO discount (userId , customerId, email ,  discount) VALUES (?,?,?,?)`).run(userId , customerId, emailSelect, discount);
          return Response.json({ ok: true , customers : customersRows , customer : customer});
      } catch (error) {
        return Response.json({ ok: false,error: error });
      }
    }

    else if (url.pathname == "/api/discountEdit" && req.method == "POST") {
      try {
        const {id} = await req.json();
        const rows = db.query('SELECT * FROM discount where id = ?').all(id);
          return Response.json({ ok: true , discount : rows});
      } catch (error) {
        return Response.json({ ok: false,error: error });
      }
    }

    else if (url.pathname == "/api/discount" && req.method == "PUT") {
      try {
        const {id , emailEdit , discount} = await req.json();
        const rows = db.query( `UPDATE discount 
          SET email = ?,  discount = ? WHERE id = ?`).run(emailEdit, discount, id);
          return Response.json({ ok: true});
      } catch (error) {
        return Response.json({ ok: false,error: error });
      }
    }

    else if (url.pathname == "/api/discountDelete" && req.method == "DELETE") {
      const {id} = await req.json();
      db.query(`DELETE FROM discount WHERE id = ?;`).run(id);
      return Response.json({ ok: true,  });
    }
  },
});
