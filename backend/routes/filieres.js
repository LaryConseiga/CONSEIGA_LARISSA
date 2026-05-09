const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = "SELECT id, code, libelle, description FROM filieres ORDER BY libelle ASC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql = "SELECT id, code, libelle, description FROM filieres WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Filière introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { code, libelle, description } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  const cod = typeof code === "string" && code.trim() ? code.trim() : null;

  const sql = "INSERT INTO filieres (code, libelle, description) VALUES (?, ?, ?)";
  const vals = [cod, lib, description ?? null];

  db.query(sql, vals, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une filière avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      code: cod,
      libelle: lib,
      description: description ?? null,
    });
  });
});

router.put("/:id", (req, res) => {
  const { code, libelle, description } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  const cod = typeof code === "string" && code.trim() ? code.trim() : null;

  const sql = `
    UPDATE filieres SET
      code = ?,
      libelle = ?,
      description = ?
    WHERE id = ?
  `;
  const vals = [cod, lib, description ?? null, req.params.id];

  db.query(sql, vals, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une filière avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Filière introuvable" });
    }
    res.json({
      id: Number(req.params.id),
      code: cod,
      libelle: lib,
      description: description ?? null,
    });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM filieres WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message:
            "Impossible de supprimer cette filière : elle est encore utilisée (ex. spécialités ou liaisons).",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Filière introuvable" });
    }
    res.json({ message: "Filière supprimée" });
  });
});

module.exports = router;
