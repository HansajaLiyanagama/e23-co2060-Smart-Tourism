const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

/** * ARCHITECTURE DECISION: Middleware
 * We use 'cors' to allow our React frontend (Port 5173) to talk to this API (Port 5000).
 * We use 'express.json()' so our server can understand JSON data sent in request bodies.
 */
app.use(cors());
app.use(express.json());

/**
 * THE HEARTBEAT ROUTE
 * Logic: A simple GET request to verify the server is 'Live'.
 * This is the first point of contact for our Three-Tier system.
 */
app.get('/api/status', (req, res) => {
    res.status(200).json({
        project: "Smart Tourism Management System",
        batch: "E23",
        status: "Active",
        message: "Server Tier is functioning correctly",
        timestamp: new Date().toISOString()
    });
});

// Logic: Use the PORT from .env or default to 5000 for local development.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` SERVER RUNNING ON: http://localhost:${PORT}`);
    console.log(` HEALTH CHECK: http://localhost:${PORT}/api/status`);
    console.log(`=========================================`);
});