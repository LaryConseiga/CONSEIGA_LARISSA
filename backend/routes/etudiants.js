const express = require("express");
const router = express.Router();
const db = require("../db");

const LIST_SQL_FULL = `
  SELECT e.id, e.nom, e.prenoms, e.pays_id, e.civilites_id, e.dateNaissance, e.email, e.telephone,
    e.created_at, e.updated_at,
    p.libelle AS pays_libelle,
    c.libelle AS civilite_libelle
  FROM etudiants e
  LEFT JOIN pays p ON p.id = e.pays_id
  LEFT JOIN civilites c ON c.id = e.civilites_id
  ORDER BY e.nom ASC, e.prenoms ASC
`;

const LIST_SQL_MIN = `
  SELECT e.id, e.nom, e.prenoms, e.pays_id, e.civilites_id, e.dateNaissance, e.email, e.telephone,
    p.libelle AS pays_libelle,
    c.libelle AS civilite_libelle
  FROM etudiants e
  LEFT JOIN pays p ON p.id = e.pays_id
  LEFT JOIN civilites c ON c.id = e.civilites_id
  ORDER BY e.nom ASC, e.prenoms ASC
`;

const GET_ONE_SQL_FULL = `
  SELECT e.id, e.nom, e.prenoms, e.pays_id, e.civilites_id, e.dateNaissance, e.email, e.telephone,
    e.created_at, e.updated_at,
    p.libelle AS pays_libelle,
    c.libelle AS civilite_libelle
  FROM etudiants e
  LEFT JOIN pays p ON p.id = e.pays_id
  LEFT JOIN civilites c ON c.id = e.civilites_id
  WHERE e.id = ?
`;

const GET_ONE_SQL_MIN = `
  SELECT e.id, e.nom, e.prenoms, e.pays_id, e.civilites_id, e.dateNaissance, e.email, e.telephone,
    p.libelle AS pays_libelle,
    c.libelle AS civilite_libelle
  FROM etudiants e
  LEFT JOIN pays p ON p.id = e.pays_id
  LEFT JOIN civilites c ON c.id = e.civilites_id
  WHERE e.id = ?
`;

function queryListEtudiants(callback) {
  db.query(LIST_SQL_FULL, (err, results) => {
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      return db.query(LIST_SQL_MIN, callback);
    }
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function queryOneEtudiant(id, callback) {
  db.query(GET_ONE_SQL_FULL, [id], (err, results) => {
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      return db.query(GET_ONE_SQL_MIN, [id], callback);
    }
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

router.get("/", (req, res) => {
  queryListEtudiants((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  queryOneEtudiant(req.params.id, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Étudiant introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { nom, prenoms, pays_id, civilites_id, dateNaissance, email, telephone } = req.body;
  const n = typeof nom === "string" ? nom.trim() : "";
  const p = typeof prenoms === "string" ? prenoms.trim() : "";
  const pid = parseInt(pays_id, 10);
  const cid = parseInt(civilites_id, 10);
  const dateN =
    typeof dateNaissance === "string" && dateNaissance.trim()
      ? dateNaissance.trim().slice(0, 10)
      : null;
  const mail = typeof email === "string" && email.trim() ? email.trim() : null;
  const tel = typeof telephone === "string" && telephone.trim() ? telephone.trim() : null;

  if (!n || !p) {
    return res.status(400).json({ message: "Le nom et les prénoms sont obligatoires." });
  }
  if (!Number.isFinite(pid) || pid < 1) {
    return res.status(400).json({ message: "Le pays est obligatoire." });
  }
  if (!Number.isFinite(cid) || cid < 1) {
    return res.status(400).json({ message: "La civilité est obligatoire." });
  }

  const sql = `
    INSERT INTO etudiants (nom, prenoms, pays_id, civilites_id, dateNaissance, email, telephone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [n, p, pid, cid, dateN, mail, tel], (err, result) => {
    if (err) {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Pays ou civilité invalide." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      nom: n,
      prenoms: p,
      pays_id: pid,
      civilites_id: cid,
      dateNaissance: dateN,
      email: mail,
      telephone: tel,
    });
  });
});

router.put("/:id", (req, res) => {
  const { nom, prenoms, pays_id, civilites_id, dateNaissance, email, telephone } = req.body;
  const n = typeof nom === "string" ? nom.trim() : "";
  const p = typeof prenoms === "string" ? prenoms.trim() : "";
  const pid = parseInt(pays_id, 10);
  const cid = parseInt(civilites_id, 10);
  const dateN =
    typeof dateNaissance === "string" && dateNaissance.trim()
      ? dateNaissance.trim().slice(0, 10)
      : null;
  const mail = typeof email === "string" && email.trim() ? email.trim() : null;
  const tel = typeof telephone === "string" && telephone.trim() ? telephone.trim() : null;

  if (!n || !p) {
    return res.status(400).json({ message: "Le nom et les prénoms sont obligatoires." });
  }
  if (!Number.isFinite(pid) || pid < 1) {
    return res.status(400).json({ message: "Le pays est obligatoire." });
  }
  if (!Number.isFinite(cid) || cid < 1) {
    return res.status(400).json({ message: "La civilité est obligatoire." });
  }

  const sql = `
    UPDATE etudiants SET
      nom = ?, prenoms = ?, pays_id = ?, civilites_id = ?,
      dateNaissance = ?, email = ?, telephone = ?
    WHERE id = ?
  `;
  db.query(sql, [n, p, pid, cid, dateN, mail, tel, req.params.id], (err, result) => {
    if (err) {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Pays ou civilité invalide." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Étudiant introuvable" });
    }
    res.json({ message: "Étudiant mis à jour" });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM etudiants WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(409).json({
          message: "Impossible de supprimer cet étudiant : des inscriptions y sont liées.",
        });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Étudiant introuvable" });
    }
    res.json({ message: "Étudiant supprimé" });
  });
});

module.exports = router;
