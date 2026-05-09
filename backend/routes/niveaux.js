const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = "SELECT id, libelle, ordre FROM niveaux ORDER BY ordre ASC, libelle ASC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql = "SELECT id, libelle, ordre FROM niveaux WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Niveau introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { libelle, ordre } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const ord = parseInt(ordre, 10);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(ord)) {
    return res.status(400).json({ message: "L’ordre est obligatoire (nombre entier)." });
  }

  const sql = "INSERT INTO niveaux (libelle, ordre) VALUES (?, ?)";
  db.query(sql, [lib, ord], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un niveau avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      libelle: lib,
      ordre: ord,
    });
  });
});

router.put("/:id", (req, res) => {
  const { libelle, ordre } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const ord = parseInt(ordre, 10);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(ord)) {
    return res.status(400).json({ message: "L’ordre est obligatoire (nombre entier)." });
  }

  const sql = "UPDATE niveaux SET libelle = ?, ordre = ? WHERE id = ?";
  db.query(sql, [lib, ord, req.params.id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un niveau avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Niveau introuvable" });
    }
    res.json({
      id: Number(req.params.id),
      libelle: lib,
      ordre: ord,
    });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM niveaux WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message:
            "Impossible de supprimer ce niveau : il est encore utilisé (ex. parcours).",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Niveau introuvable" });
    }
    res.json({ message: "Niveau supprimé" });
  });
});

module.exports = router;
