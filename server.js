const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const mariadb = require("mariadb");
const { log } = require("console");
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "",
  connectionLimit: 5,
});

app.get("/test", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const rows = await connection.query(
      "SELECT hologram_name, weight, superpower, extinct_since FROM trial_tasks.virtualZoo;"
    );
    console.log(rows);
    const jsonS = JSON.stringify(rows);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(jsonS);
  } catch (error) {}
});

http.createServer(app).listen(1337, () => {
  console.log("Express Server started on port 1337");
});
