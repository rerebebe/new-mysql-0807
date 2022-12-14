const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session"); //keep the users log in

const app = express();

app.use(express.json()); //automatically parsing every adjacent object that is sent from front-end

// make connection between front-end and back-end
app.use(
  cors({
    origin: [process.env.FRONT_END],
    method: ["GET", "POST"],
    credentials: true, //allow cookie to be enabled
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// pass all the info for our session
// app.set("trust proxy", 1);
app.use(
  session({
    key: "userId",
    secret: "this is a secret",
    resave: false,
    saveUninitialized: false,
    // store: new RedisStore({
    //   url: process.env.REDIS_URL,
    // }),
    cookie: {
      sameSite: "none",
      secure: false,
      maxAge: 86400000,
    },
  })
);

// app.use(
//   session({
//     name: "enter_the_session_name",
//     resave: false,
//     saveUninitialized: false,
//     store: sessionStore,
//     secret: "This is a secret",
//     cookie: {
//       httpOnly: true,
//       maxAge: 1000 * 60 * 60 * 2,
//       sameSite: true,
//       secure: 'production',
//     },
//   })
// );

// heroku://b8083570a6111d:7aed03be@us-cdbr-east-06.cleardb.net/heroku_bda2f46c28afe7b?reconnect=true
const db_config = {
  host: "us-cdbr-east-06.cleardb.net",
  user: "b8083570a6111d",
  password: "7aed03be",
  database: "heroku_bda2f46c28afe7b",
};
// ip-10-0-127-72.ec2.internal:57232

var db;

function handleDisconnect() {
  db = mysql.createConnection(db_config); // Recreate the connection, since
  db.connect(function (err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  db.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

// AWS database
// const db = mysql.createConnection({
//   user: "admin",
//   host: "aws-dbmysql.cdfxvmmwh998.ap-south-1.rds.amazonaws.com",
//   password: "regina7968",
//   database: "LoginSystem",
// });

// Create account
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    db.query(
      "INSERT INTO users (username, password) VALUES (?,?)",
      [username, hash],
      (err, result) => {
        if (result) {
          res.send(result);
        }
      }
    );
  });
});

// ??????????????????log in
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggined: true, user: req.session.user });
  } else {
    res.send({ loggined: false });
  }
});

// logout?
// app.get("/logout", (req, res) => {
//   if (req.session.user) {
//     req.session.destroy();
//     res.clearCookie("username");
//     res.end();
//   }
// });

// ????????????
app.post("/login", (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    db.query(
      "SELECT * FROM users WHERE username = ?",
      username,
      (err, result) => {
        if (err) {
          console.log("err from login", err);
        }

        if (result.length > 0) {
          bcrypt.compare(password, result[0].password, (error, response) => {
            if (response) {
              req.session.user = result;
              console.log("login success, req.session.user", req.session.user);
              console.log("login success, req.session.user", req.session.user);
              console.log("login success response", response);
              console.log("does it go past this line?", typeof result);

              const user = req.session.user[0];
              const username = user.username;
              console.log("user data", user, username);
              res.cookie("username", username);
              console.log("result", result);
              console.log("req body", req.body);
              res.send(result);
            } else {
              res.send({ message: "Wrong username/password combo!!" });
            }
          });
        } else {
          res.send({ message: "User doesn't exist!!" });
        }
      }
    );
  } catch (e) {
    console.log("login error", e);
  }
});

// //User??????todo??????mysql database
app.post("/todo", (req, res) => {
  const note = req.body.note;
  const date = req.body.date;
  const time = req.body.time;
  const username = req.body.username;
  console.log("/todo req.body", req.body);

  db.query(
    "INSERT INTO todo (username,note,date,time) VALUES (?,?,?,?)",
    [username, note, date, time],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send("value inserted!");
      }
    }
  );
});

// User???????????????database?????????
app.get("/gettodo", (req, res) => {
  // let username = req.query.username ?? "";
  try {
    console.log("gettodo req.body", req.body);
    console.log("req.session", req.session);
    console.log("req.session.user", req.session.user);
    //const username = req.body.username;
    //const username = req.session.user[0].username;
    const username = req.query.username ?? "";

    db.query(
      "SELECT * FROM todo WHERE username = ?",
      username,
      (err, result) => {
        if (err) {
          res.send(err);
        } else {
          res.cookie("username", username);
          res.send(result);
          console.log(req.session.user);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//???????????????????????????
app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM todo WHERE id = ?", id, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

// Update?????????????????????
app.put("/update", (req, res) => {
  console.log(" update req.body", req.body);
  const id = req.body.id;
  const note = req.body.note;
  const date = req.body.date;
  const time = req.body.time;
  db.query(
    "UPDATE todo SET note=?, date=?, time=? WHERE id = ?;",
    [note, date, time, id],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});
// app.listen(3001, () => console.log("running server")); //server???????????????

app.listen(process.env.PORT || 3001, () => {
  console.log("Sever running!!");
});
