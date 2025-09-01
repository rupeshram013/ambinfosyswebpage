// Modules & Libraries
const express = require("express");
const mysql = require("mysql2");
const { type } = require("os");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const argon2 = require("argon2");
const environment = require("dotenv");
const nodemailer = require("nodemailer");
const cookieparser = require("cookie-parser");

environment.config({ path: "../.env" });

environment.config();

// Path Initilization

const templatespath = path.join(__dirname, "../frontend/templates");
const staticpath = path.join(__dirname, "../frontend/static");
const logfilepath = path.join(__dirname, "../../logfiles");
const secretkey = process.env.COOKIE_SECRET;

// Log File Handling

function logfilehandler(content) {
  const CurrentDate = new Date();
  filename = `${logfilepath}/${CurrentDate.toDateString()}.txt`;

  fs.appendFile(filename.toString(), content, "utf8", (err) => {
    if (err) {
      console.error("--Error appending to file:", err);
      return;
    }
  });
}

// Date and Time

function getserverdate() {
  const CurrentDate = new Date();
  const finaldate = `${CurrentDate.toDateString()} ${CurrentDate.getHours()}:${CurrentDate.getMinutes()}:${CurrentDate.getMilliseconds()}`;
  return finaldate.toString();
}

// Logging in the User Information
console.log(`\n--${getserverdate()}`);

function getLocalIPv4Address() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
}

const localip = getLocalIPv4Address();
console.log(`--Server Hosted at Address :${localip}`);

logfilehandler(`\n\n--Server Hosted at Address :${localip}`);
logfilehandler(`\n--Server Was Launched At :${getserverdate()}`);

// Server Initilization

const server = express();

const port = process.env.PORT;
server.use("/", express.static(staticpath));
server.use(express.urlencoded({ extended: true }));
server.use(cookieparser(secretkey));

// Database initilization

var connection = mysql.createConnection({
  port: 3306,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 1000,
});

connection.connect((err) => {
  if (err) {
    console.log("Database Connection error : " + err);
    return;
  }
  logfilehandler("\n--Connection To database was Sucessful;");
  console.log("--Connection To database was Sucessful;");
});

function verifyAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const sql = `SELECT admin FROM users WHERE token = ?`;
  connection.query(sql, token, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const isAdmin = results[0].admin === "admin";
    if (!isAdmin) {
      return res.status(403).json({ error: "Access denied: Not admin" });
    }

    next();
  });
}

function verifyuser(req, res, next) {
  const tokenheader = req.headers["token"];
  if (!tokenheader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = tokenheader.split(" ")[1];
  console.log(token);

  const sql = `SELECT * FROM users WHERE token = ?`;
  connection.query(sql, token, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const isUser = results[0].token == token;

    console.log(isUser, results[0].token, token);

    if (!isUser) {
      return res.status(403).json({ error: "Access denied: Not admin" });
    }

    next();
  });
}

function verifyAdmindashboard(req, res, next) {
  try {
    const admincookie = req.cookies.admin;
    if (admincookie == undefined) {
      res.redirect("/login");
    }
    {
      console.log(admincookie);
      if (admincookie === "admin") {
        next();
      } else {
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.log("Admin Verification is not provided", error);
    res.redirect("/");
  }
}

// Routing
// *************************************

server.get("/", (req, res) => {
  res.sendFile(path.join(templatespath, "/index.html"));
});
server.get("/dashboard", verifyAdmindashboard, (req, res) => {
  res.sendFile(path.join(templatespath, "/dashboard.html"));
});
server.get("/product", (req, res) => {
  res.sendFile(path.join(templatespath, "/product.html"));
});
server.get("/category", (req, res) => {
  res.sendFile(path.join(templatespath, "/category.html"));
});
server.get("/search", (req, res) => {
  res.sendFile(path.join(templatespath, "/search.html"));
});
server.get("/checkout", (req, res) => {
  res.sendFile(path.join(templatespath, "/checkout.html"));
});
server.get("/profile", (req, res) => {
  res.sendFile(path.join(templatespath, "/profile.html"));
});
server.get("/login", (req, res) => {
  res.sendFile(path.join(templatespath, "/login.html"));
});

server.get("/register", (req, res) => {
  res.sendFile(path.join(templatespath, "/register.html"));
});

// Data Receiving For the webpage
// *************************************

server.get("/api/orderdata", verifyAdmin, (req, res) => {
  const query = `select * from orders`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});
server.get("/api/orderdata/:token", verifyuser, (req, res) => {
  const token = req.params.token;
  const query = `select * from orders where customerid = ${token} `;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
    console.log(result);
  });
});

server.get("/api/productdata", (req, res) => {
  const query = `select * from products`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/laptopdata", (req, res) => {
  const query = `select * from laptop`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/printerdata", (req, res) => {
  const query = `select * from printer`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/monitordata", (req, res) => {
  const query = `select * from monitor`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/aiodata", (req, res) => {
  const query = `select * from aio`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/accessoriesdata", (req, res) => {
  const query = `select * from accessories`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/networkingdata", (req, res) => {
  const query = `select * from networking`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }

    res.send(result);
  });
});

server.get("/api/standard", (req, res) => {
  const query = `select * from standard`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }

    res.send(result);
  });
});

server.get("/api/usersdata", verifyAdmin, (req, res) => {
  const query = `select token , firstname , secondname , username , usermail , phone , spending , admin from users`;

  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }

    res.send(result);
  });
});

server.get("/api/usersdata/:token", verifyuser, (req, res) => {
  const token = req.params.token;
  const query = `select token , firstname , secondname , username , usermail , phone , spending , admin from users where token = ${token}`;

  connection.query(query, (err, result) => {
    if (err) {
      console.log("Error reading data !! ;" + err);
      return;
    }
    console.log(result[0]["username"]);

    res.send(result);
  });
});

//***************************************************

//

server.post("/checkout", (req, res) => {
  let id = req.body.id;
  let category = req.body.category;
  let name = req.body.fullname;
  let quantity = req.body.quantity;
  let cost = req.body.cost;
  let address = req.body.address;
  let number = req.body.number;
  let customerid = req.body.customerid;
  const ordernumber = Math.ceil(Math.random() * 13131313);

  console.log(id, category, name, quantity, cost, address, number, customerid);

  const insertquery =
    "insert into orders (ordernumber,id , customer,customerid , quantity , cost , address , phone , category ) values (?,?,?,?,?,?,?,?,?)";
  const data = [
    ordernumber,
    id,
    name,
    customerid,
    quantity,
    cost,
    address,
    number,
    category,
  ];

  connection.query(insertquery, data, (err, result) => {
    if (err) {
      console.log("Error Inserting data !! ;" + err);
      return;
    } else {
      console.log("Data inserted sucessfully 1 !!");
    }
  });

  res.redirect("/");
});

// Image Uploading and Uploading the product
//*****************************

let imageindex = 1;
let id = Math.ceil(Math.random() * 13131313);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let category = req.body.category;
    const productpath =
      "frontend/static/images/product/" + category + "/" + id + "/";
    console.log("Multer output : ", category, productpath);
    fs.mkdir(productpath, { recursive: true }, (err) => {
      if (err) {
        console.log("Dir Couldn't be created!");
      }
      console.log("Directory created successfully!");
    });

    cb(null, productpath);
  },
  filename: (req, file, cb) => {
    cb(null, imageindex + ".png");
    imageindex = imageindex + 1;
  },
});

const upload = multer({ storage: storage });
server.post("/upload", upload.array("image", 13), (req, res) => {
  console.log("Uploading a product......");
  let name = req.body.name;
  let category = req.body.category;
  let price = req.body.price;
  let image = imageindex;
  let index = req.body.index;
  let quantity = Math.ceil(req.body.quantity);
  let warranty = req.body.warranty;
  let path = "/frontend/static/images/product/" + category + "/" + id;
  id = Math.ceil(Math.random() * 13131313);
  let standard = req.body.standard;


  var data1;
  var insertquery1;
  var data2;
  var insertquery2;

  const selectquery = `select * from products where pname = ?`;


  console.log(category, standard);

  if (category === "laptop") {
    let model = req.body.model;
    let series = req.body.series;
    let brand = req.body.brand;
    let generation = req.body.generation;
    let type = req.body.type;
    let processor = req.body.processor;
    let graphics = req.body.graphics;
    let ram = req.body.ram;
    let storage = req.body.storage;
    let display = req.body.display;
    let os = req.body.os;
    let battery = req.body.battery;
    let camera = req.body.camera;
    let ports = req.body.ports;
    let specification = processor + " " + graphics + " " + ram + " " + storage + " " + display;

    data1 = [id,name,image,index,path,brand,specification,price,warranty,quantity,category,];
    insertquery1 = `insert into products(id,pname,image,pindex,imagepath,brand,specification,price,warranty,quantity,category) values (?,?,?,?,?,?,?,?,?,?,?)`;
    data2 = [id,model,series,type,processor,graphics,ram,display,os,battery,camera,ports,generation,storage,];
    insertquery2 = `insert into laptop(id,model,series,type,processor,graphics,ram,display,os,battery,camera,ports,generation,storage) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  }

  if (category === "printer") {
    let model = req.body.model;
    let paper = req.body.paper;
    let dpi = req.body.dpi;
    let brand = req.body.brand;
    let weight = req.body.weight;
    let display = req.body.display;
    let color = req.body.color;
    let connectivity = req.body.connectivity;
    let speed = req.body.speed;
    let size = req.body.size;
    let os = req.body.os;
    let specification = color + " " + dpi + " " + connectivity;

    data1 = [id,name,image,index,path,brand,specification,price,warranty,quantity,category,];
    insertquery1 = `insert into products(id,pname,image,pindex,imagepath,brand,specification,price,warranty,quantity,category) values (?,?,?,?,?,?,?,?,?,?,?)`;
    data2 = [id,model,paper,dpi,weight,display,color,connectivity,speed,size,os,];
    insertquery2 = `insert into printer(id,model,paper,dpi,weight,display,color,connectivity,speed,size,os) values (?,?,?,?,?,?,?,?,?,?,?)`;

  }

  if (category === "monitor") {
    let resolution = req.body.resolution;
    let size = req.body.size;
    let ports = req.body.ports;
    let brand = req.body.brand;
    let type = req.body.type;
    let panel = req.body.panel;
    let color = req.body.color;
    let response = req.body.response;
    let ratio = req.body.ratio;
    let refresh = req.body.refresh;
    let specification = resolution + " " + refresh + " " + ratio;

    data1 = [id,name,image,index,path,brand,specification,price,warranty,quantity,category,];
    insertquery1 = `insert into products(id,pname,image,pindex,imagepath,brand,specification,price,warranty,quantity,category) values (?,?,?,?,?,?,?,?,?,?,?)`;
    data2 = [id,resolution,size,ports,type,panel,color,response,ratio,refresh,];
    insertquery2 = `insert into monitor(id,resolution,size,ports,type,panel,color,response,ratio,refresh) values (?,?,?,?,?,?,?,?,?,?)`;
  }

  if (standard === "yes") {
    console.log("Standard Matched");

    let col1 = req.body.col1;
    let col2 = req.body.col2;
    let col3 = req.body.col3;
    let col4 = req.body.col4;
    let col5 = req.body.col5;
    let col6 = req.body.col6;
    let col7 = req.body.col7;
    let specification = col1 + col2 + col3;
    let brand = req.body.brand;

    data1 = [id,name,image,index,path,brand,specification,price,warranty,quantity,category,standard,];
    insertquery1 = `insert into products(id,pname,image,pindex,imagepath,brand,specification,price,warranty,quantity,category,standard) values (?,?,?,?,?,?,?,?,?,?,?,?)`;
    data2 = [id, col1, col2, col3, col4, col5, col6, col7];
    insertquery2 = `insert into standard(id,col1,col2,col3,col4,col5,col6,col7) values (?,?,?,?,?,?,?,?)`;
  }

  connection.query(selectquery, name, (err, result) => {
      if (err) {
        console.log("Error reading data !! ;" + err);
        return;
      }

      if (result[0] === undefined) {
        console.log("It was a null value");
        connection.query(insertquery1, data1, (err, result) => {
          if (err) {
            console.log("Error Inserting data !! ;" + err);
            return;
          } else {
            console.log("Data inserted sucessfully 1 !!");
          }
        });

        connection.query(insertquery2, data2, (err, result) => {
          if (err) {
            console.log("Error Inserting data !! ;" + err);
            return;
          } else {
            console.log("Data inserted sucessfully 2 !!");
          }
        });
        res.redirect("/dashboard");
      } else {
        console.log("It is not a null value");
        res.redirect("/dashboard?error=205");
      }
  });

  imageindex = 1;
});

server.post("/login", async (req, res) => {
  const usermail = req.body.mail;
  const password = req.body.password;

  const query = `select token , username , usermail , userpass , admin from users where usermail = ? `;
  // let users = readusers();

  connection.query(query, usermail, async (err, result) => {
    try {
      const passwordverify = await argon2.verify(result[0]["userpass"],password);

      if (result[0] === undefined) {
        console.log("It was a null value");
        res.redirect("/login?error=413");

      } else {

        if (passwordverify) {
          console.log("login was sucessful");
          var token = null;
          var username = null;
          var admin = null;
          token = result[0]["token"];
          username = result[0]["username"];
          admin = result[0]["admin"];

          console.log(token, username, admin);

          res.cookie("token", token);
          res.cookie("username", username);
          res.cookie("admin", admin);
          res.redirect("/");
        } else {
          res.redirect("/login?error=416");
        }
      }
    } catch (error) {
      console.log("Error :", error);
      res.redirect("/login?error=416");
    }
  });
});

server.post("/register", async (req, res) => {
  const firstname = req.body.first;
  const secondname = req.body.last;
  const username = req.body.username;
  const usermail = req.body.email;
  const reqpassword = req.body.pass1;

  const token = Math.ceil(Math.random() * 13131313);
  const password = await argon2.hash(reqpassword);

  console.log(token, firstname, secondname, username, usermail, password);
  const data = [token, firstname, secondname, username, usermail, password];
  const query = `insert into users (token,firstname,secondname,username, usermail ,  userpass ) VALUES (?,?,?,?,?,?)`;

  const selectquery = `select * from users where usermail = ? `;

  try {
    connection.query(selectquery, usermail, (err, result) => {
      if (err) {
        console.log("Error reading data !! ;" + err);
        return;
      }

      if (result[0] === undefined) {
        console.log("It was a null value");
        connection.query(query, data, (err, result) => {
          if (err) {
            console.log("Error Inserting data !! ;" + err);
            return;
          } else {
            console.log("Data inserted sucessfully !!");
            console.log("Affected rows : ", result.affectedRows);
            console.log("Inserted ID", result.insertId);
            res.cookie("token", token);
            res.cookie("username", username);
            res.redirect("/");
          }
        });
      } else {
        res.redirect("/register?error=201");
      }
    });
  } catch (error) {
    console.log("Error :", error);
  }
});

// 404 CODE NOT FOUND REQUEST SENDING

server.use((req, res, next) => {
  res.status(404).send("Sorry, we couldn't find that page!");
});

// Listening

server.listen(port, () => {
  logfilehandler(`\n--Server was initilized at port :${port}`);
  console.log(`--Server was initilized at port :${port}`);
});
