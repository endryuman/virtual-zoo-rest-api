const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "gandro",
  connectionLimit: 5,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/animals", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const rows = await connection.query(
      "SELECT id, hologram_name, weight, superpower, extinct_since FROM trial_tasks.virtualZoo;"
    );
    console.log(rows);
    const jsonS = JSON.stringify(rows);
    res.writeHead(200);
    res.end(jsonS);
  } catch (error) {}
});

app.post("/animals", async (req, res) => {
  let connection;
  try {
    const { hologram_name, weight, superpower, extinct_since } = req.body;
    connection = await pool.getConnection();
    const rows = await connection.query(
      `INSERT INTO trial_tasks.virtualZoo (hologram_name, weight, superpower, extinct_since) VALUES ('${hologram_name}', ${weight}, '${superpower}', ${extinct_since});`
    );
    console.log(rows);
    res.writeHead(201);
    res.end("Animal was added");
  } catch (error) {
    console.log(error);
  }
});

app.patch("/animals/:id", async (req, res) => {
  let connection;
  try {
    console.log(req.body);
    const { id } = req.params;
    const { hologram_name, weight, superpower, extinct_since } = req.body;
    connection = await pool.getConnection();

    let updateFields = [];
    if (hologram_name) updateFields.push(`hologram_name = '${hologram_name}'`);
    if (weight) updateFields.push(`weight = '${weight}'`);
    if (superpower) updateFields.push(`superpower = '${superpower}'`);
    if (extinct_since) updateFields.push(`extinct_since = '${extinct_since}'`);

    const updateFieldsString = updateFields.join(", ");
    const rows = await connection.query(
      `UPDATE trial_tasks.virtualZoo SET ${updateFieldsString}
      WHERE id = ${id};`
    );
    console.log(rows);
    res.writeHead(200);
    res.end("Animal data was changed");
  } catch (error) {
    console.log(error);
  }
});

app.delete("/animals/:id", async (req, res) => {
  let connection;
  try {
    console.log(req.body);
    const { id } = req.params;

    connection = await pool.getConnection();
    const rows = await connection.query(
      `Delete FROM trial_tasks.virtualZoo WHERE id = ${id};`
    );
    console.log(rows);
    res.writeHead(200);
    res.end("Animal was deleted");
  } catch (error) {
    console.log(error);
  }
});

http.createServer(app).listen(1337, () => {
  console.log("Express Server started on port 1337");
});
