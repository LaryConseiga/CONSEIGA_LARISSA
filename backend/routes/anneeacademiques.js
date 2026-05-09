const express = require("express");
const router = express.Router();
const db = require("../db");

function parseEstActive(v) {
  if (v === true || v === 1 || v === "1") return 1;
  if (v === false || v === 0 || v === "0") return 0;
  return 0;
}

/** Si une année est marquée active, les autres passent à 0 (une seule année active à la fois). */
function clearOtherActive(exceptId, callback) {
  const sql = "UPDATE anneeacademiques SET est_active = 0 WHERE id <> ?";
  db.query(sql, [exceptId], callback);
}

router.get("/", (req, res) => {
  const sql =
    "SELECT id, libelle, date_debut, date_fin, est_active FROM anneeacademiques ORDER BY date_debut DESC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql =
    "SELECT id, libelle, date_debut, date_fin, est_active FROM anneeacademiques WHERE id = ?";
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Année académique introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { libelle, date_debut, date_fin, est_active } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const d0 = typeof date_debut === "string" ? date_debut.trim().slice(0, 10) : "";
  const d1 = typeof date_fin === "string" ? date_fin.trim().slice(0, 10) : "";
  const active = parseEstActive(est_active);

  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!d0 || !d1) {
    return res.status(400).json({ message: "Les dates de début et de fin sont obligatoires." });
  }

  const sql =
    "INSERT INTO anneeacademiques (libelle, date_debut, date_fin, est_active) VALUES (?, ?, ?, ?)";
  db.query(sql, [lib, d0, d1, active], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une année avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    const newId = result.insertId;
    if (active) {
      clearOtherActive(newId, (e2) => {
        if (e2) {
          return res.status(500).json({ message: "Erreur serveur", erreur: e2.message });
        }
        res.status(201).json({
          id: newId,
          libelle: lib,
          date_debut: d0,
          date_fin: d1,
          est_active: active,
        });
      });
    } else {
      res.status(201).json({
        id: newId,
        libelle: lib,
        date_debut: d0,
        date_fin: d1,
        est_active: active,
      });
    }
  });
});

router.put("/:id", (req, res) => {
  const { libelle, date_debut, date_fin, est_active } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const d0 = typeof date_debut === "string" ? date_debut.trim().slice(0, 10) : "";
  const d1 = typeof date_fin === "string" ? date_fin.trim().slice(0, 10) : "";
  const active = parseEstActive(est_active);
  const id = req.params.id;

  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!d0 || !d1) {
    return res.status(400).json({ message: "Les dates de début et de fin sont obligatoires." });
  }

  const sql =
    "UPDATE anneeacademiques SET libelle = ?, date_debut = ?, date_fin = ?, est_active = ? WHERE id = ?";
  db.query(sql, [lib, d0, d1, active, id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Une année avec ce libellé existe déjà." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Année académique introuvable" });
    }
    if (active) {
      clearOtherActive(Number(id), (e2) => {
        if (e2) {
          return res.status(500).json({ message: "Erreur serveur", erreur: e2.message });
        }
        res.json({
          id: Number(id),
          libelle: lib,
          date_debut: d0,
          date_fin: d1,
          est_active: active,
        });
      });
    } else {
      res.json({
        id: Number(id),
        libelle: lib,
        date_debut: d0,
        date_fin: d1,
        est_active: active,
      });
    }
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM anneeacademiques WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message:
            "Impossible de supprimer cette année : elle est encore référencée (ex. inscriptions, classes).",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Année académique introuvable" });
    }
    res.json({ message: "Année académique supprimée" });
  });
});

module.exports = router;
