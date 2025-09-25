// Modules & Libraries
const express = require("express");
const mysql = require("mysql2");
const { type } = require("os");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const bcrypt = require("bcryptjs");
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

// Mailing Server
function mailingserver (usermail,service,code){
  const transporter = nodemailer.createTransport({
    service:"gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAILID,
      pass: process.env.MAILPASSWORD,
    },
  });

  // Wrap in an async IIFE so we can use await.
  if(service === "verification"){

    (async () => {
      const info = await transporter.sendMail({
        from: process.env.MAILID,
        to: `${usermail}`,
        subject: "Verification Code",
        text: `Hello User,

A login attempt has recently been conducted . You may need to Verify your Account . Therefore your Verification Code is Provided Below :

Code : ${code}

Hope the user experience of the site matches your expectations .

Thank You
AmbInfosys Team`,
      });
  
      console.log("Message sent:", info.messageId);
    })();

  }else if(service === "Login Attempt"){

      (async () => {
      const info = await transporter.sendMail({
        from: process.env.MAILID,
        to: `${usermail}`,
        subject: "Recent Login",
        text: `Hello User,

You have recently Logged in to your Account .If you are having an issue please let us know.

Hope the user experience of the site matches your expectations .

Thank You
AmbInfosys Team`,
      });
  
      console.log("Message sent:", info.messageId);
    })();
  
  }
  else if(service === "Register Attempt"){

      (async () => {
      const info = await transporter.sendMail({
        from: process.env.MAILID,
        to: `${usermail}`,
        subject: "Registered Completed",
        text: `Hello User,

You have recently registered in to your new Account .If you are having an issue please let us know.

Hope the user experience of the site matches your expectations .

Thank You
AmbInfosys Team`,
      });
  
      console.log("Message sent:", info.messageId);
    })();
  
  }else {
    const arugment1 = service.split("?")[0]
    const arugment2 = service.split("?")[1]

    if(arugment1 === "password"){

      (async () => {
      const info = await transporter.sendMail({
        from: process.env.MAILID,
        to: `${usermail}`,
        subject: "Password Change",
        text: `Hello User,

As you want to reset your password . Here's the link to reset your password .

Link : http://192.168.1.135/passwordchange?userid=${arugment2}

Hope the user experience of the site matches your expectations .

Thank You
AmbInfosys Team`,
      });
  
        console.log("Message sent:", info.messageId);
      })();
    }

    if(arugment1 === "delivery"){

      (async () => {
      const info = await transporter.sendMail({
        from: process.env.MAILID,
        to: `${usermail}`,
        subject: "Product Delivery",
        text: `Hello User,

Your Product is on delivery please check your account for the recent changes .

Hope the user experience of the site matches your expectations .

Thank You
AmbInfosys Team`,
      });
  
        console.log("Message sent:", info.messageId);
      })();
    }
  }
}

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
    logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
    logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
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
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      logfilehandler(`\n-- Error Occured : ${error} from ${req.ip} at ${getserverdate()}`);
      return res.status(401).json({ error: "Invalid token" });
    }

    const isAdmin = results[0].admin === "admin";
    if (!isAdmin) {
      logfilehandler(`\n-- Error Occured : ${error} from ${req.ip} at ${getserverdate()}`);
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

  const sql = `SELECT * FROM users WHERE token = ?`;
  connection.query(sql, token, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      logfilehandler(`\n-- Error Occured : ${error} from ${req.ip} at ${getserverdate()}`);
      return res.status(401).json({ error: "Invalid token" });
    }

    const isUser = results[0].token == token;
    if (!isUser) {
      logfilehandler(`\n-- Error Occured : ${error} from ${req.ip} at ${getserverdate()}`);
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
    }{
      if (admincookie === "admin") {
        mailingserver("ambinfosys@gmail.com","Admin");
        logfilehandler(`\n--Admin Logged on to the system from ${req.ip} at ${getserverdate()}`);
        next();
      } else {
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.log("Admin Verification is not provided", error);
    logfilehandler(`\n-- Error Occured : ${error} from ${req.ip} at ${getserverdate()}`);
    res.redirect("/");
  }
}



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  number = 0;
  for(i = 1 ; i<=7 ; i++){
    digit = Math.floor(Math.random() * (max - min + 1)) + min;

    number = (number * 10 ) + digit
  }

  return number
}




function verifycode (req,res,next){

  const usertoken = req.cookies["token"];
  var usermail;
  var selectquery = "select verification from users where token = ?";

  connection.query(selectquery,usertoken,(err,results) => {
    if(err){
      console.log("Error Reading Data" , err)
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
    }else{

      if(results[0]["verification"] != "verified"){
          if(usertoken != undefined){
          const sql = `SELECT usermail FROM users WHERE token = ?`;
          connection.query(sql, usertoken, (err, results) => {
            if (err) {
              console.error("DB error:", err);
              logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
              return res.status(500).json({ err: "Database error" });
            }
        
            if (results.length === 0) {
              return res.status(401).json({ error: "Invalid token" });
            }
        
            usermail = results[0]["usermail"];
            const randomCode = getRandomInt(0,7);
            res.cookie("code",randomCode,{maxAge: 60000, httpOnly: true});
            logfilehandler(`\n--Verification Code was Mailed to ${req.ip} at ${getserverdate()}`);
            console.log(`\n--Verification Code was Mailed to ${req.ip} at ${getserverdate()}`);
            mailingserver(usermail,"verification",randomCode)
            next();
          });

        }else{
          res.redirect("/login")
        }
      }else{
        res.redirect("/");
      }


    }
  })


    

}



function verifycheckout (req,res,next){

  const usertoken = req.cookies["token"];
  var usermail;

  if(usertoken != undefined){
    const sql = `SELECT verification FROM users WHERE token = ?`;
    connection.query(sql, usertoken, (err, results) => {
      if (err) {
        console.error("DB error:", err);
        logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
        return res.status(500).json({ err: "Database error" });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid token" });
      }
  
      verification = results[0]["verification"];

      if(verification === "null" || !verification || verification == null){
        res.redirect("/verification")
      }else{
        if(verification.toUpperCase() === "VERIFIED"){
          next();
        }else{
          res.redirect("/verification")
        }
      }
    });

    

  }else{
    res.redirect("/login")
  }

}

// Routing
// *************************************

server.get("/", (req, res) => {
  res.sendFile(path.join(templatespath, "/index.html"));
});

server.get("/termsofuse", (req, res) => {
  res.sendFile(path.join(templatespath, "/use.html"));
});

server.get("/privacy", (req, res) => {
  res.sendFile(path.join(templatespath, "/privacy.html"));
});

server.get("/termsofsales", (req, res) => {
  res.sendFile(path.join(templatespath, "/sales.html"));
});

server.get("/copyrights", (req, res) => {
  res.sendFile(path.join(templatespath, "/copyright.html"));
});

server.get("/dashboard", verifyAdmindashboard, (req, res) => {
  console.log(`--Get Request Was Performed on Admin Page  ${req.ip}`);
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
server.get("/checkout",verifycheckout, (req, res) => {
  res.sendFile(path.join(templatespath, "/checkout.html"));
});
server.get("/profile",(req, res) => {

  if(req.cookies["token"] == null || req.cookies["token"] == undefined || req.cookies["token"] === "" )
  {
    res.redirect("/login")
  }else{
    res.sendFile(path.join(templatespath, "/profile.html"));
  }

});
server.get("/login", (req, res) => {
  res.sendFile(path.join(templatespath, "/login.html"));
});

server.get("/register", (req, res) => {
  res.sendFile(path.join(templatespath, "/register.html"));
});

server.get("/verification",verifycode,(req, res) => {
  res.sendFile(path.join(templatespath, "/verification.html"));

});

server.get("/password",(req, res) => {
  res.sendFile(path.join(templatespath, "/password.html"));
});

server.get("/passwordchange",(req, res) => {
  res.sendFile(path.join(templatespath, "/passwordchange.html"));
});

// Data Receiving For the webpage
// *************************************


server.get("/api/orderdata", verifyAdmin, (req, res) => {
  const query = `select * from orders`;
  connection.query(query, (err, result) => {
    if (err) {
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/productdata", (req, res) => {
  const query = `select * from products`;
  connection.query(query, (err, result) => {
    if (err) {
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});
server.get("/api/usersdata", verifyAdmin, (req, res) => {
  const query = `select token , firstname , secondname , username , usermail , phone , spending , admin , verification from users`;

  connection.query(query, (err, result) => {
    if (err) {
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});

server.get("/api/:category", (req, res) => {
  const query = `select * from ${req.params.category}`;
  connection.query(query, (err, result) => {
    if (err) {
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      console.log("Error reading data !! ;" + err);
      res.redirect("/")
    }
    res.send(result);
  });
});


server.get("/api/orderdata/:token", verifyuser, (req, res) => {
  const token = req.params.token;
  const query = `select orders.* , products.pname from orders inner join products on orders.id = products.id  where orders.customerid = ${token} `;
  connection.query(query, (err, result) => {
    if (err) {
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      console.log("Error reading data !! ;" + err);
      return;
    }
    res.send(result);
  });
});


server.get("/api/usersdata/:token", verifyuser, (req, res) => {
  const token = req.params.token;
  const query = `select token , firstname , secondname , username , usermail , phone , spending , admin , verification from users where token = ${token}`;

  connection.query(query, (err, result) => {
    if (err) {
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      console.log("Error reading data !! ;" + err);
      return;
    }

    res.send(result);
  });
});

//***************************************************

// Checkout Middle ware .


server.post("/checkout", (req, res) => {
  let id = req.body.id;
  let productname = req.body.pname;
  let category = req.body.category;
  let name = req.body.fullname;
  let quantity = req.body.quantity;
  let cost = req.body.cost;
  let address = req.body.address;
  let number = req.body.number;
  let customerid = req.body.customerid;
  const ordernumber = Math.ceil(Math.random() * 13131313);

  const insertquery = "insert into orders (ordernumber,id , customer,customerid , quantity , cost , address , phone , category , status ) values (?,?,?,?,?,?,?,?,?,'To Be Delivered')";
  const data = [ordernumber,id,name,customerid,quantity,cost,address,number,category,];

  connection.query(insertquery, data, (err, result) => {
    if (err) {
      console.log("Error Inserting data !! ;" + err);
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      return;
    } else {
      logfilehandler(`\n--A Purchase was made from user ${name} with token ${customerid} from ${req.ip}`);
      console.log(`--A Purchase was made from user ${name} with token ${customerid} from ${req.ip}`);
    }
  });

  res.redirect("/");
});

// Delete Order

server.post("/deleteorder",(req,res)=>{

  const usertoken = req.cookies["token"];
  const ordernumber = req.body.orderid

  var selectquery = "select status from orders where customerid = ?"
  connection.query(selectquery,usertoken,(err,results) =>{

    if(err){
      console.log("Unable to read orders data" , err)
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
    }else{

      const status = results[0]["status"]
      if(status === "On Delivery"){
          res.redirect("/profile?deleteerror=304")
        }else{

          var updatequery = "delete from orders where ordernumber = ?"

          connection.query(updatequery,ordernumber,(err,results) =>{

            if(err){
              console.log("Coulnd't update the order data");
              logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);

            }else{
              
              logfilehandler(`\n--Order was canceled by user ${usertoken} from ${req.ip} at ${getserverdate()}`);
              console.log(`--Order was canceled by user ${usertoken} from ${req.ip} at ${getserverdate()}`);
              res.redirect("/profile")
            }

          })

        }
    }

  })
  
})

// Password Change

server.post("/password",(req,res,next)=>{


  const usermail = req.body.email
  const selectquery = "select token from users where usermail = ? "

  connection.query(selectquery,usermail, (err, result) => {
    if (err) {
      console.log("Error Inserting data !! ;" + err);
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      return;
    } else {
      
      if(result[0] != null){
        res.cookie("token",result[0]["token"],{maxAge:60000});
        mailingserver(usermail,`password?${result[0]["token"]}`);
        logfilehandler(`\n--Password change attempty was made by user having mail ${usermail} from ${req.ip} at ${getserverdate()}`);
        console.log(`--Password change attempty was made by user having mail ${usermail} from ${req.ip} at ${getserverdate()}`);
        res.send("Check Your Mail For Password Changing Link.")
        
      }else{
        res.redirect("/password?error=404")
      }
    }

  });

})

server.post("/passwordchange",async (req,res,next)=>{


  const token = req.body.token
  const password = await argon2.hash(req.body.pass1);

  const updatequery = "update users set userpass = ? where token = ?"
  try{
    connection.query(updatequery,[password,token], (err, result) => {
      if (err) {
        console.log("Error Inserting data !! ;" + err);
        logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
        return;
      } else {
        logfilehandler(`\n--Password was changed by user having mail ${token} from ${req.ip} at ${getserverdate()}`);
        console.log(`--Password was changed by user having mail ${token} from ${req.ip} at ${getserverdate()}`);
        res.redirect("/login")
      }
  
    });

  }catch(err){
    res.redirect("/password")
  }

})

// Delivery to be conducted

server.post("/deliver" , (req,res)=>{

  const ordernumber = req.body.ordernumber
  const usertoken = req.cookies["token"]

  var selectquery = "select status , customerid from orders where ordernumber = ?"
  connection.query(selectquery,ordernumber,(err,results) =>{

    if(err){
      console.log("Unable to read orders data" , err)
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
    }else{

      const status = results[0]["status"]

      if(status === "On Delivery" || status === "To Be Delivered"){

        let updatequery = "update orders set status = 'On Delivery' where ordernumber = ?"

        connection.query(updatequery,ordernumber,(err,results1) => {

          if(err){
            console.log("Error Updating the orders")
            logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
          }else{
            
            let usermailselect = "select usermail from users where token = ?"
            console.log(results[0])
            console.log("ID",results[0]["customerid"])

            connection.query(usermailselect,results[0]["customerid"],(err,results2) =>{

              if(err){
                console.log("Usermail Couldn't be read")
                logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
              }else{
                
                logfilehandler(`\n--Order was Set to delivery for user ${usertoken} from ${req.ip} at ${getserverdate()}`);
                console.log(`--Order was Set to delivery for user ${usertoken} from ${req.ip} at ${getserverdate()}`);
                console.log(results2[0]["usermail"])
                mailingserver(results2[0]["usermail"],"delivery")
                res.redirect("/dashboard")
              }

            })


            

          }

        })

      }else{
        res.redirect("/dashboard?error=1305")
      }

    }
  })


})


// Verification of the User 

server.post("/verification",(req,res)=>{
  let code = req.body.verification

  const cookiecode = req.cookies["code"]
  const token = req.cookies["token"]

  insertdata = ["verified",token]
  insertquery = "UPDATE users SET verification = ? WHERE token = ?"

  if(code == cookiecode){
    
    connection.query(insertquery, insertdata, (err, result) => {
      if (err) {
        console.log("Error Inserting data !! ;" + err);
        logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
        return;
      } else {
        logfilehandler(`\n--Verification was provided to user ${token} from ${req.ip} at ${getserverdate()}`);
        console.log(`--Verification was provided to user ${token} from ${req.ip} at ${getserverdate()}`);
        res.redirect("/")
      }
  });
  }else{
    res.redirect("/verification?error=113")
  }
})


// Image Uploading and Uploading the product
//*****************************

let imageindex = 1;
let id = Math.ceil(Math.random() * 13131313);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let category = req.body.category;
    const productpath = "frontend/static/images/product/" + category + "/" + id + "/";
    fs.mkdir(productpath, { recursive: true }, (err) => {
      if (err) {
        console.log("Dir Couldn't be created!");
        logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      }
      console.log("Directory created successfully!");
      logfilehandler(`\n-- Directory Created Sucessfully from ${req.ip} at ${getserverdate()}`);
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
        logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
        return;
      }

      if (result[0] === undefined) {
        connection.query(insertquery1, data1, (err, result) => {
          if (err) {
            console.log("Error Inserting data !! ;" + err);
            logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
            return;
          } else {
            console.log("Data inserted sucessfully 1 !!");
          }
        });

        connection.query(insertquery2, data2, (err, result) => {
          if (err) {
            console.log("Error Inserting data !! ;" + err);
            logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
            return;
          } else {
            console.log("Data inserted sucessfully 2 !!");
          }
        });
        
        res.redirect("/dashboard");
      } else {
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
      const passwordverify = await bcrypt.compare(password,result[0]["userpass"]);

      if (result[0] === undefined) {

        res.redirect("/login?error=413");

      } else {

        if (passwordverify) {
          var token = result[0]["token"];
          var username = result[0]["username"];
          var admin = result[0]["admin"];

          res.cookie("token", token);
          res.cookie("username", username);
          res.cookie("admin", admin);
          logfilehandler(`\n--User Logged in with usertoken ${token} from ${req.ip} at ${getserverdate()}`);
          console.log(`--User Logged in with usertoken ${token} from ${req.ip} at ${getserverdate()}`);
          mailingserver(usermail,"Login Attempt");
          res.redirect("/verification");
        } else {
          res.redirect("/login?error=416");
        }
      }
    } catch (error) {
      console.log("Error :", error);
      logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
      res.redirect("/login?error=413");
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
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(reqpassword, salt);

  const data = [token, firstname, secondname, username, usermail, password];
  const query = `insert into users (token,firstname,secondname,username, usermail ,  userpass ) VALUES (?,?,?,?,?,?)`;

  const selectquery = `select * from users where usermail = ? `;

  try {
    connection.query(selectquery, usermail, (err, result) => {
      if (err) {
        console.log("Error reading data !! ;" + err);
        logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
        return;
      }

      if (result[0] === undefined) {
        connection.query(query, data, (err, result) => {
          if (err) {

            console.log("Error Inserting data !! ;" + err);
            logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
            return;
          } else {
            res.cookie("token", token);
            res.cookie("username", username);
            logfilehandler(`\n--User registered in with usertoken ${token} from ${req.ip} at ${getserverdate()}`);
            console.log(`--User registered in with usertoken ${token} from ${req.ip} at ${getserverdate()}`);
            mailingserver (usermail,"Register Attempt")
            res.redirect("/verification");
          }
        });
      } else {
        res.redirect("/register?error=201");
      }
    });
  } catch (error) {

    logfilehandler(`\n-- Error Occured : ${err} from ${req.ip} at ${getserverdate()}`);
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
