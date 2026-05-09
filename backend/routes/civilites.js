const express = require("express");
const router = express.Router();
const db = require("../db");

/** Liste pour sélecteurs (étudiants, etc.) */
router.get("/", (req, res) => {
  const sql = "SELECT id, libelle, abreviation FROM civilites ORDER BY libelle ASC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
