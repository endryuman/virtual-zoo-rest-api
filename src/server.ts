import * as http from "http";
import express from "express";
import bodyParser from "body-parser";
import { Pool, PoolConnection, createPool } from "mariadb";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

export const pool: Pool = createPool({
  host: "localhost",
  user: "root",
  password: "gandro",
  connectionLimit: 5,
});

app.get("/animals", async (req, res) => {
  let connection: PoolConnection | undefined;
  try {
    connection = await pool.getConnection();
    const rows = await connection.query(
      "SELECT id, hologram_name, weight, superpower, extinct_since FROM trial_tasks.virtualZoo;"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.post("/animals", async (req, res) => {
  let connection: PoolConnection | undefined;
  try {
    const { hologram_name, weight, superpower, extinct_since } = req.body;
    connection = await pool.getConnection();
    const answer = await connection.query(
      `INSERT INTO trial_tasks.virtualZoo (hologram_name, weight, superpower, extinct_since) VALUES
       ('${hologram_name}', ${weight}, '${superpower}', ${extinct_since});`
    );

    const rows = await connection.query(
      `SELECT id, hologram_name, weight, superpower, extinct_since FROM trial_tasks.virtualZoo WHERE id = ${Number(
        answer.insertId
      )};`
    );
    res.status(201).json({ message: "Animal was added", data: rows });
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.patch("/animals/:id", async (req, res) => {
  let connection: PoolConnection | undefined;
  try {
    const { id } = req.params;
    const { hologram_name, weight, superpower, extinct_since } = req.body;
    connection = await pool.getConnection();

    let updateFields: string[] = [];
    if (hologram_name) updateFields.push(`hologram_name = '${hologram_name}'`);
    if (weight) updateFields.push(`weight = '${weight}'`);
    if (superpower) updateFields.push(`superpower = '${superpower}'`);
    if (extinct_since) updateFields.push(`extinct_since = '${extinct_since}'`);

    const updateFieldsString = updateFields.join(", ");
    const rows = await connection.query(
      `UPDATE trial_tasks.virtualZoo SET ${updateFieldsString}
      WHERE id = ${id};`
    );
    res.status(200).json({ message: "Animal data was changed" });
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.delete("/animals/:id", async (req, res) => {
  let connection: PoolConnection | undefined;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const rows = await connection.query(
      `DELETE FROM trial_tasks.virtualZoo WHERE id = ${id};`,
      [id]
    );
    res.status(200).json({ message: "Animal was deleted" });
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

http.createServer(app).listen(1337, () => {
  console.log("Express Server started on port 1337");
});
