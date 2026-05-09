const express = require("express");
const db = require("../db");

const router = express.Router();

function fmt(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return "0";
  return v.toLocaleString("fr-FR");
}

/**
 * GET /api/dashboard/stats
 * Compteurs pour le tableau de bord (tables gestion-2ie).
 */
router.get("/stats", (req, res) => {
  const out = {};
  let pending = 4;
  let failed = null;

  const finish = () => {
    pending -= 1;
    if (pending > 0) return;
    if (failed) {
      return res.status(500).json({ message: failed });
    }
    res.json({
      totalEtudiants: fmt(out.totalEtudiants),
      nombreEcoles: fmt(out.nombreEcoles),
      inscriptionsCetteAnnee: fmt(out.inscriptionsCetteAnnee),
      filieresActives: fmt(out.filieresActives),
    });
  };

  db.query("SELECT COUNT(*) AS n FROM etudiants", (err, rows) => {
    if (err) failed = err.message;
    else out.totalEtudiants = rows[0]?.n ?? 0;
    finish();
  });

  db.query("SELECT COUNT(*) AS n FROM ecoles", (err, rows) => {
    if (err) failed = err.message;
    else out.nombreEcoles = rows[0]?.n ?? 0;
    finish();
  });

  // Inscriptions liées à l'année académique marquée active, sinon année civile courante
  db.query(
    `SELECT COUNT(*) AS n FROM inscriptions i
     WHERE EXISTS (
       SELECT 1 FROM anneeacademiques a
       WHERE a.id = i.annee_academique_id AND a.est_active = 1
     )
     OR (
       NOT EXISTS (SELECT 1 FROM anneeacademiques a2 WHERE a2.est_active = 1)
       AND YEAR(i.dateInscription) = YEAR(CURDATE())
     )`,
    (err, rows) => {
      if (err) failed = err.message;
      else out.inscriptionsCetteAnnee = rows[0]?.n ?? 0;
      finish();
    }
  );

  db.query(
    `SELECT COUNT(DISTINCT filieres_id) AS n FROM ecolesfilieres
     WHERE LOWER(COALESCE(statut, 'actif')) = 'actif'`,
    (err, rows) => {
      if (err) failed = err.message;
      else {
        let n = rows[0]?.n ?? 0;
        if (n === 0) {
          db.query("SELECT COUNT(*) AS n FROM filieres", (err2, rows2) => {
            if (err2) failed = err2.message;
            else out.filieresActives = rows2[0]?.n ?? 0;
            finish();
          });
          return;
        }
        out.filieresActives = n;
      }
      finish();
    }
  );
});

/**
 * GET /api/dashboard/activites-recentes
 * Dernières actions "déductibles" depuis la base (sans table d'audit).
 * Retourne une liste homogène: [{ id, libelle, date }]
 */
router.get("/activites-recentes", (req, res) => {
  const limitRaw = req.query.limit;
  const limit = Math.max(1, Math.min(20, Number(limitRaw) || 6));

  // Remarque: on s'appuie sur les timestamps existants (etudiants.created_at, inscriptions.created_at).
  // Les autres tables (ex: ecoles) ne disposent pas toujours de timestamps.
  const sql = `
    (SELECT
      CONCAT('inscription-', i.id) AS id,
      CONCAT('Étudiant inscrit : ', e.nom, ' ', e.prenoms) AS libelle,
      i.created_at AS at
    FROM inscriptions i
    JOIN etudiants e ON e.id = i.etudiants_id
    ORDER BY i.created_at DESC
    LIMIT ?)
    UNION ALL
    (SELECT
      CONCAT('etudiant-', e.id) AS id,
      CONCAT('Étudiant ajouté : ', e.nom, ' ', e.prenoms) AS libelle,
      e.created_at AS at
    FROM etudiants e
    ORDER BY e.created_at DESC
    LIMIT ?)
    ORDER BY at DESC
    LIMIT ?;
  `;

  db.query(sql, [limit, limit, limit], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    const activites = (rows || []).map((r) => ({
      id: String(r.id),
      libelle: String(r.libelle ?? ""),
      // date lisible côté UI, mais on garde un format simple ici
      date: r.at ? new Date(r.at).toLocaleDateString("fr-FR") : null,
    }));
    res.json(activites);
  });
});

module.exports = router;
