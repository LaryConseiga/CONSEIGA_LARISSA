const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = "SELECT id, libelle, adresse, telephone, email FROM ecoles ORDER BY libelle ASC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql = "SELECT id, libelle, adresse, telephone, email FROM ecoles WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "École introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { libelle, adresse, telephone, email } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }

  const sql = "INSERT INTO ecoles (libelle, adresse, telephone, email) VALUES (?, ?, ?, ?)";
  const vals = [lib, adresse ?? null, telephone ?? null, email ?? null];

  db.query(sql, vals, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une école avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      libelle: lib,
      adresse: adresse ?? null,
      telephone: telephone ?? null,
      email: email ?? null,
    });
  });
});

router.put("/:id", (req, res) => {
  const { libelle, adresse, telephone, email } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }

  const sql = `
    UPDATE ecoles SET
      libelle = ?,
      adresse = ?,
      telephone = ?,
      email = ?
    WHERE id = ?
  `;
  const vals = [lib, adresse ?? null, telephone ?? null, email ?? null, req.params.id];

  db.query(sql, vals, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une école avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "École introuvable" });
    }
    res.json({
      id: Number(req.params.id),
      libelle: lib,
      adresse: adresse ?? null,
      telephone: telephone ?? null,
      email: email ?? null,
    });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM ecoles WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "École introuvable" });
    }
    res.json({ message: "École supprimée" });
  });
});

module.exports = router;
