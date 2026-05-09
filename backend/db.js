require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "gestion-ecole",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    connectTimeout: 10_000,
});

db.connect((err) => {
    if (err) {
        console.error("Erreur de connexion MySQL :", err.message);
        return;
    }
    console.log(`Connecté à la base de données MySQL (${db.config.database}@${db.config.host}:${db.config.port})`);
});

module.exports = db;
