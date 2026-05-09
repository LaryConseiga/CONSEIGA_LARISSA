const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = "SELECT id, libelle, nationalite, code, iso FROM pays ORDER BY libelle ASC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql = "SELECT id, libelle, nationalite, code, iso FROM pays WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Pays introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { libelle, nationalite, code, iso } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  const nat = nationalite != null && String(nationalite).trim() ? String(nationalite).trim() : null;
  const cod = code != null && String(code).trim() ? String(code).trim() : null;
  const isoVal = iso != null && String(iso).trim() ? String(iso).trim() : null;

  const sql = "INSERT INTO pays (libelle, nationalite, code, iso) VALUES (?, ?, ?, ?)";
  db.query(sql, [lib, nat, cod, isoVal], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un pays avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      libelle: lib,
      nationalite: nat,
      code: cod,
      iso: isoVal,
    });
  });
});

router.put("/:id", (req, res) => {
  const { libelle, nationalite, code, iso } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  const nat = nationalite != null && String(nationalite).trim() ? String(nationalite).trim() : null;
  const cod = code != null && String(code).trim() ? String(code).trim() : null;
  const isoVal = iso != null && String(iso).trim() ? String(iso).trim() : null;

  const sql = "UPDATE pays SET libelle = ?, nationalite = ?, code = ?, iso = ? WHERE id = ?";
  db.query(sql, [lib, nat, cod, isoVal, req.params.id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un pays avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pays introuvable" });
    }
    res.json({
      id: Number(req.params.id),
      libelle: lib,
      nationalite: nat,
      code: cod,
      iso: isoVal,
    });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM pays WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message: "Impossible de supprimer ce pays : il est encore référencé (ex. étudiants).",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pays introuvable" });
    }
    res.json({ message: "Pays supprimé" });
  });
});

module.exports = router;
