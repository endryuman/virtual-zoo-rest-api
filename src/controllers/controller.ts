import { PoolConnection } from "mariadb";
import { pool } from "../server";

export const getAnimals = async (req, res) => {
  let connection: PoolConnection | undefined;
  try {
    connection = await pool.getConnection();
    const rows = await connection.query(
      "SELECT id, hologram_name, weight, superpower, extinct_since FROM trial_tasks.virtualZoo;"
    );
    console.log(rows);
    const jsonS = JSON.stringify(rows);
    res.writeHead(200);
    res.end(jsonS);
  } catch (error) {
    console.log(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
