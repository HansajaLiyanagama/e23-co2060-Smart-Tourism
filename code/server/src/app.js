const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// PostgreSQL Connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "tourism_db",
    password: "1234", // CHANGE THIS
    port: 5432,
});

// Test DB connection
pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error("Database connection error", err));

// ================= ROUTES =================

// By Interest API
app.get("/api/by-interest/:category", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM destinations WHERE category = $1",
            [req.params.category]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// By Location API
app.get("/api/by-location/:district", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM destinations WHERE district = $1",
            [req.params.district]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
