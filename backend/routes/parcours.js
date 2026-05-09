const express = require("express");
const router = express.Router();
const db = require("../db");

const LIST_SQL = `
  SELECT p.id, p.libelle, p.specialites_id, p.niveaux_id, p.cycles_id,
    s.libelle AS specialite_libelle,
    n.libelle AS niveau_libelle,
    c.libelle AS cycle_libelle
  FROM parcours p
  LEFT JOIN specialites s ON s.id = p.specialites_id
  LEFT JOIN niveaux n ON n.id = p.niveaux_id
  LEFT JOIN cycles c ON c.id = p.cycles_id
  ORDER BY p.libelle ASC
`;

function parseCyclesId(cycles_id) {
  if (cycles_id === undefined || cycles_id === null || cycles_id === "") return null;
  const n = parseInt(cycles_id, 10);
  return Number.isFinite(n) ? n : null;
}

router.get("/", (req, res) => {
  db.query(LIST_SQL, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

/** Premier parcours dont la spécialité est rattachée à la filière et le niveau correspond (inscription via classe). */
router.get("/match", (req, res) => {
  const fid = parseInt(req.query.filiere_id, 10);
  const nid = parseInt(req.query.niveau_id, 10);
  if (!Number.isFinite(fid) || fid < 1 || !Number.isFinite(nid) || nid < 1) {
    return res.status(400).json({ message: "Les paramètres filiere_id et niveau_id sont obligatoires." });
  }
  const sql = `
    SELECT p.id, p.libelle, p.specialites_id, p.niveaux_id, p.cycles_id,
      s.libelle AS specialite_libelle,
      n.libelle AS niveau_libelle
    FROM parcours p
    INNER JOIN specialites s ON s.id = p.specialites_id
    INNER JOIN niveaux n ON n.id = p.niveaux_id
    WHERE s.filieres_id = ? AND p.niveaux_id = ?
    ORDER BY p.id ASC
    LIMIT 1
  `;
  db.query(sql, [fid, nid], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (!results.length) {
      return res.status(404).json({
        message:
          "Aucun parcours ne correspond à cette filière et ce niveau. Créez ou complétez les parcours / spécialités.",
      });
    }
    res.json(results[0]);
  });
});

router.get("/:id", (req, res) => {
  const sql = `
    SELECT p.id, p.libelle, p.specialites_id, p.niveaux_id, p.cycles_id,
      s.libelle AS specialite_libelle,
      n.libelle AS niveau_libelle,
      c.libelle AS cycle_libelle
    FROM parcours p
    LEFT JOIN specialites s ON s.id = p.specialites_id
    LEFT JOIN niveaux n ON n.id = p.niveaux_id
    LEFT JOIN cycles c ON c.id = p.cycles_id
    WHERE p.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Parcours introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { libelle, specialites_id, niveaux_id, cycles_id } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const sid = parseInt(specialites_id, 10);
  const nid = parseInt(niveaux_id, 10);
  const cid = parseCyclesId(cycles_id);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(sid) || sid < 1) {
    return res.status(400).json({ message: "La spécialité est obligatoire." });
  }
  if (!Number.isFinite(nid) || nid < 1) {
    return res.status(400).json({ message: "Le niveau est obligatoire." });
  }

  const sql =
    "INSERT INTO parcours (libelle, specialites_id, niveaux_id, cycles_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [lib, sid, nid, cid], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un parcours avec ce libellé existe déjà." });
      }
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Référence invalide (spécialité, niveau ou cycle)." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      libelle: lib,
      specialites_id: sid,
      niveaux_id: nid,
      cycles_id: cid,
    });
  });
});

router.put("/:id", (req, res) => {
  const { libelle, specialites_id, niveaux_id, cycles_id } = req.body;
  const lib = typeof libelle === "string" ? libelle.trim() : "";
  const sid = parseInt(specialites_id, 10);
  const nid = parseInt(niveaux_id, 10);
  const cid = parseCyclesId(cycles_id);
  if (!lib) {
    return res.status(400).json({ message: "Le libellé est obligatoire." });
  }
  if (!Number.isFinite(sid) || sid < 1) {
    return res.status(400).json({ message: "La spécialité est obligatoire." });
  }
  if (!Number.isFinite(nid) || nid < 1) {
    return res.status(400).json({ message: "Le niveau est obligatoire." });
  }

  const sql = `
    UPDATE parcours SET
      libelle = ?,
      specialites_id = ?,
      niveaux_id = ?,
      cycles_id = ?
    WHERE id = ?
  `;
  db.query(sql, [lib, sid, nid, cid, req.params.id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Un parcours avec ce libellé existe déjà." });
      }
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Référence invalide (spécialité, niveau ou cycle)." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parcours introuvable" });
    }
    res.json({
      id: Number(req.params.id),
      libelle: lib,
      specialites_id: sid,
      niveaux_id: nid,
      cycles_id: cid,
    });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM parcours WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message:
            "Impossible de supprimer ce parcours : il est encore utilisé (ex. inscriptions).",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Parcours introuvable" });
    }
    res.json({ message: "Parcours supprimé" });
  });
});

module.exports = router;
