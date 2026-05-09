const express = require("express");
const router = express.Router();
const db = require("../db");

/** Noms de table possibles selon les schémas (pluriel / singulier). */
const TABLE_CANDIDATES = ["classes", "classe"];

/** Table réellement utilisée après la première résolution réussie (évite de retester à chaque requête). */
let resolvedTable = null;

function makeListSql(table) {
  return `
  SELECT c.id, c.libelle, c.filiere_id, c.niveau_id, c.annee_academique_id, c.created_at, c.updated_at,
    f.libelle AS filiere_libelle,
    n.libelle AS niveau_libelle,
    a.libelle AS annee_academique_libelle
  FROM \`${table}\` c
  LEFT JOIN filieres f ON f.id = c.filiere_id
  LEFT JOIN niveaux n ON n.id = c.niveau_id
  LEFT JOIN anneeacademiques a ON a.id = c.annee_academique_id
  ORDER BY c.libelle ASC
`;
}

function makeGetOneSql(table) {
  return `
    SELECT c.id, c.libelle, c.filiere_id, c.niveau_id, c.annee_academique_id, c.created_at, c.updated_at,
      f.libelle AS filiere_libelle,
      n.libelle AS niveau_libelle,
      a.libelle AS annee_academique_libelle
    FROM \`${table}\` c
    LEFT JOIN filieres f ON f.id = c.filiere_id
    LEFT JOIN niveaux n ON n.id = c.niveau_id
    LEFT JOIN anneeacademiques a ON a.id = c.annee_academique_id
    WHERE c.id = ?
  `;
}

function makeGetOneSqlMin(table) {
  return `
    SELECT c.id, c.libelle, c.filiere_id, c.niveau_id, c.annee_academique_id,
      f.libelle AS filiere_libelle,
      n.libelle AS niveau_libelle,
      a.libelle AS annee_academique_libelle
    FROM \`${table}\` c
    LEFT JOIN filieres f ON f.id = c.filiere_id
    LEFT JOIN niveaux n ON n.id = c.niveau_id
    LEFT JOIN anneeacademiques a ON a.id = c.annee_academique_id
    WHERE c.id = ?
  `;
}

function resolveTable(callback) {
  if (resolvedTable) {
    return callback(null, resolvedTable);
  }
  let i = 0;
  const tryNext = () => {
    if (i >= TABLE_CANDIDATES.length) {
      return callback(null, null);
    }
    const t = TABLE_CANDIDATES[i++];
    db.query(`SELECT 1 FROM \`${t}\` LIMIT 1`, (err) => {
      if (err && err.code === "ER_NO_SUCH_TABLE") {
        return tryNext();
      }
      if (err) {
        return callback(err);
      }
      resolvedTable = t;
      callback(null, t);
    });
  };
  tryNext();
}

/** Liste sans colonnes created_at/updated_at si absentes en base. */
function makeListSqlMin(table) {
  return `
  SELECT c.id, c.libelle, c.filiere_id, c.niveau_id, c.annee_academique_id,
    f.libelle AS filiere_libelle,
    n.libelle AS niveau_libelle,
    a.libelle AS annee_academique_libelle
  FROM \`${table}\` c
  LEFT JOIN filieres f ON f.id = c.filiere_id
  LEFT JOIN niveaux n ON n.id = c.niveau_id
  LEFT JOIN anneeacademiques a ON a.id = c.annee_academique_id
  ORDER BY c.libelle ASC
`;
}

function queryListForTable(table, callback) {
  const sql = makeListSql(table);
  db.query(sql, (err, results) => {
    if (err && err.code === "ER_BAD_FIELD_ERROR") {
      return db.query(makeListSqlMin(table), callback);
    }
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

router.get("/", (req, res) => {
  resolveTable((err, table) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (!table) {
      return res.json([]);
    }
    queryListForTable(table, (err2, results) => {
      if (err2) {
        if (err2.code === "ER_NO_SUCH_TABLE") {
          resolvedTable = null;
          return res.json([]);
        }
        return res.status(500).json({ message: "Erreur serveur", erreur: err2.message });
      }
      res.json(results);
    });
  });
});

router.get("/:id", (req, res) => {
  resolveTable((err, table) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (!table) {
      return res.status(404).json({ message: "Classe introuvable (aucune table classes / classe)." });
    }
    const t = table;
    db.query(makeGetOneSql(t), [req.params.id], (e, results) => {
      if (e && e.code === "ER_BAD_FIELD_ERROR") {
        return db.query(makeGetOneSqlMin(t), [req.params.id], (e2, rows) => {
          if (e2) {
            return res.status(500).json({ message: "Erreur serveur", erreur: e2.message });
          }
          if (rows.length === 0) {
            return res.status(404).json({ message: "Classe introuvable" });
          }
          res.json(rows[0]);
        });
      }
      if (e) {
        return res.status(500).json({ message: "Erreur serveur", erreur: e.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Classe introuvable" });
      }
      res.json(results[0]);
    });
  });
});

router.post("/", (req, res) => {
  resolveTable((err, table) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (!table) {
      return res.status(503).json({
        message:
          "La table des classes est absente. Créez la table « classes » (ou « classe ») dans MySQL, " +
          "puis redémarrez l’API si besoin. Script d’aide : backend/sql/create_table_classes.sql",
      });
    }

    const { libelle, filiere_id, niveau_id, annee_academique_id } = req.body;
    const lib = typeof libelle === "string" ? libelle.trim() : "";
    const fid = parseInt(filiere_id, 10);
    const nid = parseInt(niveau_id, 10);
    const aid = parseInt(annee_academique_id, 10);

    if (!lib) {
      return res.status(400).json({ message: "Le libellé est obligatoire." });
    }
    if (!Number.isFinite(fid) || fid < 1) {
      return res.status(400).json({ message: "La filière est obligatoire." });
    }
    if (!Number.isFinite(nid) || nid < 1) {
      return res.status(400).json({ message: "Le niveau est obligatoire." });
    }
    if (!Number.isFinite(aid) || aid < 1) {
      return res.status(400).json({ message: "L’année académique est obligatoire." });
    }

    const sql = `INSERT INTO \`${table}\` (libelle, filiere_id, niveau_id, annee_academique_id) VALUES (?, ?, ?, ?)`;
    db.query(sql, [lib, fid, nid, aid], (e, result) => {
      if (e) {
        if (e.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({ message: "Filière, niveau ou année académique invalide." });
        }
        if (e.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Une classe identique existe déjà." });
        }
        return res.status(500).json({ message: "Erreur serveur", erreur: e.message });
      }
      res.status(201).json({
        id: result.insertId,
        libelle: lib,
        filiere_id: fid,
        niveau_id: nid,
        annee_academique_id: aid,
      });
    });
  });
});

router.put("/:id", (req, res) => {
  resolveTable((err, table) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (!table) {
      return res.status(503).json({
        message: "La table des classes est absente. Voir backend/sql/create_table_classes.sql",
      });
    }

    const { libelle, filiere_id, niveau_id, annee_academique_id } = req.body;
    const lib = typeof libelle === "string" ? libelle.trim() : "";
    const fid = parseInt(filiere_id, 10);
    const nid = parseInt(niveau_id, 10);
    const aid = parseInt(annee_academique_id, 10);

    if (!lib) {
      return res.status(400).json({ message: "Le libellé est obligatoire." });
    }
    if (!Number.isFinite(fid) || fid < 1) {
      return res.status(400).json({ message: "La filière est obligatoire." });
    }
    if (!Number.isFinite(nid) || nid < 1) {
      return res.status(400).json({ message: "Le niveau est obligatoire." });
    }
    if (!Number.isFinite(aid) || aid < 1) {
      return res.status(400).json({ message: "L’année académique est obligatoire." });
    }

    const sql = `
    UPDATE \`${table}\`
    SET libelle = ?, filiere_id = ?, niveau_id = ?, annee_academique_id = ?
    WHERE id = ?
  `;
    db.query(sql, [lib, fid, nid, aid, req.params.id], (e, result) => {
      if (e) {
        if (e.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(400).json({ message: "Filière, niveau ou année académique invalide." });
        }
        if (e.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Une classe identique existe déjà." });
        }
        return res.status(500).json({ message: "Erreur serveur", erreur: e.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Classe introuvable" });
      }
      res.json({
        id: Number(req.params.id),
        libelle: lib,
        filiere_id: fid,
        niveau_id: nid,
        annee_academique_id: aid,
      });
    });
  });
});

router.delete("/:id", (req, res) => {
  resolveTable((err, table) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (!table) {
      return res.status(503).json({ message: "La table des classes est absente." });
    }

    const sql = `DELETE FROM \`${table}\` WHERE id = ?`;
    db.query(sql, [req.params.id], (e, result) => {
      if (e) {
        if (e.errno === 1451) {
          return res.status(409).json({
            message: "Impossible de supprimer cette classe : elle est encore référencée.",
          });
        }
        return res.status(500).json({ message: "Erreur serveur", erreur: e.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Classe introuvable" });
      }
      res.json({ message: "Classe supprimée" });
    });
  });
});

module.exports = router;
