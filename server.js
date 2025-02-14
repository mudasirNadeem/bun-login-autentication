import { Database } from "bun:sqlite";
import login from "./index.html";
import signup from "./sign-up.html";
import dashboard from "./dashboard.html";
import customerstable from "./customer-table.html";

var db = new Database("userLogin.db");
db.query(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`
).run();

db.query(
  `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      name TEXT,
      email TEXT unique,
      phone TEXT,
      address TEXT,
      customerType TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `
).run();

Bun.serve({
  static: {
    "/": login,
    "/signup": signup,
    "/dashboard": dashboard,
    "/customerstable": customerstable,
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
      const { name, email, phone, address, customerType } = await req.json();
      try {
        db.query(
          `INSERT INTO customers (name, email, phone, address, customerType) VALUES (?, ?,?,?,?)`
        ).run(name, email, phone, address, customerType);
        return Response.json({ ok: true });
      } catch (error) {
        return Response.json({ ok: false,error: error });
      }
    }else if (url.pathname == "/api/cutomerTable" && req.method == "GET") {
      try {
        const rows = db.prepare('SELECT * FROM customers').all();
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
        var user = db
        .query(
          `SELECT name, phone, address, customerType FROM Customers 
           WHERE name = ? AND phone = ? AND address = ? AND customerType = ? AND email = ?`
        )
        .get(name, phone, address, customerType, email);
        if(user){
          return Response.json({ ok: false });
        }
        else{
          db.query(
            `UPDATE Customers 
             SET name = ?, email = ? , phone = ?, address = ?, customerType = ? WHERE id = ?;`
          ).run(name, email, phone, address, customerType , id);
          return Response.json({ ok: true });
        }
    
      } catch (error) {
        return Response.json({ ok: false, error: error.message });
      }
    }
 
  },
});
