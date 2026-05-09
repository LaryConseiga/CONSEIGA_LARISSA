const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = "SELECT id, libelle, duree_annees FROM cycles ORDER BY libelle ASC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql = "SELECT id, libelle, duree_annees FROM cycles WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Cycle introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { libelle, duree_annees } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const duree = parseInt(duree_annees, 10);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(duree) || duree < 1) {
    return res.status(400).json({ message: "La durée en années doit être un entier ≥ 1." });
  }

  const sql = "INSERT INTO cycles (libelle, duree_annees) VALUES (?, ?)";
  db.query(sql, [lib, duree], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un cycle avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      libelle: lib,
      duree_annees: duree,
    });
  });
});

router.put("/:id", (req, res) => {
  const { libelle, duree_annees } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const duree = parseInt(duree_annees, 10);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(duree) || duree < 1) {
    return res.status(400).json({ message: "La durée en années doit être un entier ≥ 1." });
  }

  const sql = "UPDATE cycles SET libelle = ?, duree_annees = ? WHERE id = ?";
  db.query(sql, [lib, duree, req.params.id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un cycle avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cycle introuvable" });
    }
    res.json({
      id: Number(req.params.id),
      libelle: lib,
      duree_annees: duree,
    });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM cycles WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message:
            "Impossible de supprimer ce cycle : il est encore référencé (ex. parcours).",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cycle introuvable" });
    }
    res.json({ message: "Cycle supprimé" });
  });
});

module.exports = router;
