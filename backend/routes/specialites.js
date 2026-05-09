const express = require("express");
const router = express.Router();
const db = require("../db");

/** Table `specialites` : id, libelle, filieres_id (FK filieres), description */

const LIST_SQL = `
  SELECT s.id, s.libelle, s.filieres_id, s.description, f.libelle AS filiere_libelle
  FROM specialites s
  LEFT JOIN filieres f ON f.id = s.filieres_id
  ORDER BY f.libelle ASC, s.libelle ASC
`;

router.get("/", (req, res) => {
  db.query(LIST_SQL, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql = `
    SELECT s.id, s.libelle, s.filieres_id, s.description, f.libelle AS filiere_libelle
    FROM specialites s
    LEFT JOIN filieres f ON f.id = s.filieres_id
    WHERE s.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Spécialité introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { libelle, filieres_id, description } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const fid = parseInt(filieres_id, 10);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(fid) || fid < 1) {
    return res.status(400).json({ message: "La filière est obligatoire." });
  }

  const sql = "INSERT INTO specialites (libelle, filieres_id, description) VALUES (?, ?, ?)";
  const vals = [lib, fid, description ?? null];

  db.query(sql, vals, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une spécialité avec ce libellé existe déjà." });
      }
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Filière invalide." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      libelle: lib,
      filieres_id: fid,
      description: description ?? null,
    });
  });
});

router.put("/:id", (req, res) => {
  const { libelle, filieres_id, description } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const fid = parseInt(filieres_id, 10);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(fid) || fid < 1) {
    return res.status(400).json({ message: "La filière est obligatoire." });
  }

  const sql = `
    UPDATE specialites SET
      libelle = ?,
      filieres_id = ?,
      description = ?
    WHERE id = ?
  `;
  const vals = [lib, fid, description ?? null, req.params.id];

  db.query(sql, vals, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une spécialité avec ce libellé existe déjà." });
      }
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Filière invalide." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Spécialité introuvable" });
    }
    res.json({
      id: Number(req.params.id),
      libelle: lib,
      filieres_id: fid,
      description: description ?? null,
    });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM specialites WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message:
            "Impossible de supprimer cette spécialité : elle est encore utilisée (ex. parcours).",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Spécialité introuvable" });
    }
    res.json({ message: "Spécialité supprimée" });
  });
});

module.exports = router;
