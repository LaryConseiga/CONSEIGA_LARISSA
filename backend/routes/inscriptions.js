const express = require("express");
const router = express.Router();
const db = require("../db");

function findClasseRow(classesId, callback) {
  const id = parseInt(classesId, 10);
  if (!Number.isFinite(id) || id < 1) {
    return callback(new Error("INVALID_CLASSE"));
  }
  db.query(
    "SELECT id, filiere_id, niveau_id, annee_academique_id FROM `classes` WHERE id = ? LIMIT 1",
    [id],
    (err, rows) => {
      if (err && err.code === "ER_NO_SUCH_TABLE") {
        return db.query(
          "SELECT id, filiere_id, niveau_id, annee_academique_id FROM `classe` WHERE id = ? LIMIT 1",
          [id],
          (err2, rows2) => {
            if (err2) {
              return callback(err2);
            }
            callback(null, rows2 && rows2[0] ? rows2[0] : null);
          }
        );
      }
      if (err) {
        return callback(err);
      }
      callback(null, rows && rows[0] ? rows[0] : null);
    }
  );
}

function findParcoursForClasse(filiereId, niveauId, callback) {
  const sql = `
    SELECT p.id
    FROM parcours p
    INNER JOIN specialites s ON s.id = p.specialites_id
    WHERE s.filieres_id = ? AND p.niveaux_id = ?
    ORDER BY p.id ASC
    LIMIT 1
  `;
  db.query(sql, [filiereId, niveauId], (err, rows) => {
    if (err) {
      return callback(err);
    }
    if (!rows.length) {
      return callback(null, null);
    }
    callback(null, rows[0].id);
  });
}

const LIST_SQL = `
  SELECT i.id, i.etudiants_id, i.parcours_id, i.annee_academique_id, i.decisions_id,
    i.dateInscription, i.created_at,
    CONCAT(TRIM(COALESCE(e.nom,'')), ' ', TRIM(COALESCE(e.prenoms,''))) AS etudiant_libelle,
    p.libelle AS parcours_libelle,
    a.libelle AS annee_libelle,
    d.libelle AS decision_libelle
  FROM inscriptions i
  LEFT JOIN etudiants e ON e.id = i.etudiants_id
  LEFT JOIN parcours p ON p.id = i.parcours_id
  LEFT JOIN anneeacademiques a ON a.id = i.annee_academique_id
  LEFT JOIN decisions d ON d.id = i.decisions_id
  ORDER BY i.dateInscription DESC, i.id DESC
`;

router.get("/", (req, res) => {
  db.query(LIST_SQL, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.json(results);
  });
});

/**
 * Inscription à partir d’une classe (filière + niveau + année) : résout le parcours compatible.
 * Champs optionnels en base : classes_id, numero_inscription, statut_paiement (voir sql/alter_inscriptions_etendu.sql).
 */
router.post("/par-classe", (req, res) => {
  const { etudiants_id, classes_id, decisions_id, dateInscription, numero_inscription, statut_paiement } =
    req.body;
  const eid = parseInt(etudiants_id, 10);
  const cidClasse = parseInt(classes_id, 10);
  const did = parseInt(decisions_id, 10);
  const dateIns =
    typeof dateInscription === "string" && dateInscription.trim()
      ? dateInscription.trim().slice(0, 10)
      : null;
  const numIns =
    typeof numero_inscription === "string" && numero_inscription.trim()
      ? numero_inscription.trim().slice(0, 50)
      : null;
  const statPay =
    typeof statut_paiement === "string" && statut_paiement.trim()
      ? statut_paiement.trim().slice(0, 80)
      : null;

  if (!Number.isFinite(eid) || eid < 1) {
    return res.status(400).json({ message: "L’étudiant est obligatoire." });
  }
  if (!Number.isFinite(cidClasse) || cidClasse < 1) {
    return res.status(400).json({ message: "La classe est obligatoire." });
  }
  if (!Number.isFinite(did) || did < 1) {
    return res.status(400).json({ message: "Le statut académique (décision) est obligatoire." });
  }
  if (!dateIns) {
    return res.status(400).json({ message: "La date d’inscription est obligatoire." });
  }

  findClasseRow(cidClasse, (errClasse, classe) => {
    if (errClasse) {
      return res.status(500).json({ message: "Erreur serveur", erreur: errClasse.message });
    }
    if (!classe) {
      return res.status(404).json({ message: "Classe introuvable." });
    }
    const fid = classe.filiere_id;
    const nid = classe.niveau_id;
    const aid = classe.annee_academique_id;

    findParcoursForClasse(fid, nid, (errP, parcoursId) => {
      if (errP) {
        return res.status(500).json({ message: "Erreur serveur", erreur: errP.message });
      }
      if (!parcoursId) {
        return res.status(400).json({
          message:
            "Aucun parcours ne correspond à la filière et au niveau de cette classe. Complétez les parcours et spécialités.",
        });
      }

      const baseVals = [eid, parcoursId, aid, did, dateIns];
      const fullVals = [...baseVals, cidClasse, numIns, statPay];

      const tryInsert = (extended) => {
        if (extended) {
          const sql = `
            INSERT INTO inscriptions (etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription, classes_id, numero_inscription, statut_paiement)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(sql, fullVals, (err, result) => {
            if (err && err.code === "ER_BAD_FIELD_ERROR") {
              return tryInsert(false);
            }
            if (err) {
              if (err.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(400).json({ message: "Référence invalide (étudiant, parcours, année ou décision)." });
              }
              return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
            }
            res.status(201).json({
              id: result.insertId,
              etudiants_id: eid,
              parcours_id: parcoursId,
              annee_academique_id: aid,
              decisions_id: did,
              dateInscription: dateIns,
              classes_id: cidClasse,
              numero_inscription: numIns,
              statut_paiement: statPay,
            });
          });
        } else {
          const sql = `
            INSERT INTO inscriptions (etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.query(sql, baseVals, (err, result) => {
            if (err) {
              if (err.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(400).json({ message: "Référence invalide (étudiant, parcours, année ou décision)." });
              }
              return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
            }
            console.warn(
              "[inscriptions] Insertion sans classes_id / numero_inscription / statut_paiement : exécutez backend/sql/alter_inscriptions_etendu.sql"
            );
            res.status(201).json({
              id: result.insertId,
              etudiants_id: eid,
              parcours_id: parcoursId,
              annee_academique_id: aid,
              decisions_id: did,
              dateInscription: dateIns,
            });
          });
        }
      };

      tryInsert(true);
    });
  });
});

router.get("/:id", (req, res) => {
  const sql = `
    SELECT i.id, i.etudiants_id, i.parcours_id, i.annee_academique_id, i.decisions_id,
      i.dateInscription, i.created_at,
      CONCAT(TRIM(COALESCE(e.nom,'')), ' ', TRIM(COALESCE(e.prenoms,''))) AS etudiant_libelle,
      p.libelle AS parcours_libelle,
      a.libelle AS annee_libelle,
      d.libelle AS decision_libelle
    FROM inscriptions i
    LEFT JOIN etudiants e ON e.id = i.etudiants_id
    LEFT JOIN parcours p ON p.id = i.parcours_id
    LEFT JOIN anneeacademiques a ON a.id = i.annee_academique_id
    LEFT JOIN decisions d ON d.id = i.decisions_id
    WHERE i.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Inscription introuvable" });
    }
    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription } =
    req.body;
  const eid = parseInt(etudiants_id, 10);
  const pid = parseInt(parcours_id, 10);
  const aid = parseInt(annee_academique_id, 10);
  const did = parseInt(decisions_id, 10);
  const dateIns =
    typeof dateInscription === "string" && dateInscription.trim()
      ? dateInscription.trim()
      : null;
  if (!Number.isFinite(eid) || eid < 1) {
    return res.status(400).json({ message: "L’étudiant est obligatoire." });
  }
  if (!Number.isFinite(pid) || pid < 1) {
    return res.status(400).json({ message: "Le parcours est obligatoire." });
  }
  if (!Number.isFinite(aid) || aid < 1) {
    return res.status(400).json({ message: "L’année académique est obligatoire." });
  }
  if (!Number.isFinite(did) || did < 1) {
    return res.status(400).json({ message: "La décision est obligatoire." });
  }
  if (!dateIns) {
    return res.status(400).json({ message: "La date d’inscription est obligatoire." });
  }

  const sql = `
    INSERT INTO inscriptions (etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [eid, pid, aid, did, dateIns], (err, result) => {
    if (err) {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Référence invalide (étudiant, parcours, année ou décision)." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      etudiants_id: eid,
      parcours_id: pid,
      annee_academique_id: aid,
      decisions_id: did,
      dateInscription: dateIns,
    });
  });
});

router.put("/:id", (req, res) => {
  const { etudiants_id, parcours_id, annee_academique_id, decisions_id, dateInscription } =
    req.body;
  const eid = parseInt(etudiants_id, 10);
  const pid = parseInt(parcours_id, 10);
  const aid = parseInt(annee_academique_id, 10);
  const did = parseInt(decisions_id, 10);
  const dateIns =
    typeof dateInscription === "string" && dateInscription.trim()
      ? dateInscription.trim()
      : null;
  if (!Number.isFinite(eid) || eid < 1) {
    return res.status(400).json({ message: "L’étudiant est obligatoire." });
  }
  if (!Number.isFinite(pid) || pid < 1) {
    return res.status(400).json({ message: "Le parcours est obligatoire." });
  }
  if (!Number.isFinite(aid) || aid < 1) {
    return res.status(400).json({ message: "L’année académique est obligatoire." });
  }
  if (!Number.isFinite(did) || did < 1) {
    return res.status(400).json({ message: "La décision est obligatoire." });
  }
  if (!dateIns) {
    return res.status(400).json({ message: "La date d’inscription est obligatoire." });
  }

  const sql = `
    UPDATE inscriptions SET
      etudiants_id = ?,
      parcours_id = ?,
      annee_academique_id = ?,
      decisions_id = ?,
      dateInscription = ?
    WHERE id = ?
  `;
  db.query(sql, [eid, pid, aid, did, dateIns, req.params.id], (err, result) => {
    if (err) {
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({ message: "Référence invalide (étudiant, parcours, année ou décision)." });
      }
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Inscription introuvable" });
    }
    res.json({ message: "Inscription mise à jour" });
  });
});

router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM inscriptions WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Inscription introuvable" });
    }
    res.json({ message: "Inscription supprimée" });
  });
});

module.exports = router;
