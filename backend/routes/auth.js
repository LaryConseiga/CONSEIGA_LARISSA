const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ message: "Token manquant." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide." });
    }
    req.utilisateur = decoded;
    next();
  });
};

router.post("/register", (req, res) => {
  const { nom, email, password } = req.body;
  if (!nom || !email || !password) {
    return res.status(400).json({ message: "Nom, email et mot de passe requis." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO utilisateurs (nom, email, password) VALUES (?, ?, ?)",
    [nom, email, hashedPassword],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Cet email est déjà utilisé." });
        }
        return res.status(500).json({ message: "Erreur serveur.", erreur: err.message });
      }
      res.status(201).json({
        id: result.insertId,
        nom,
        email,
      });
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  db.query(
    "SELECT id, nom, email, password FROM utilisateurs WHERE LOWER(email) = LOWER(?)",
    [email],
    (err, results) => {
      if (err) {
        console.error("[auth/login] MySQL:", err.code, err.message);
        return res.status(500).json({ message: "Erreur serveur.", erreur: err.message });
      }
      if (results.length === 0) {
        return res.status(401).json({ message: "Email ou mot de passe invalide." });
      }

      const utilisateur = results[0];
      const hash = utilisateur.password;
      if (!hash || typeof hash !== "string") {
        console.error("[auth/login] Mot de passe manquant en base pour", utilisateur.email);
        return res.status(500).json({ message: "Compte incomplet côté serveur." });
      }

      let passwordMatches = false;
      try {
        passwordMatches = bcrypt.compareSync(password, hash);
      } catch (e) {
        console.error("[auth/login] bcrypt:", e);
        return res.status(500).json({ message: "Erreur serveur.", erreur: "Hash mot de passe invalide." });
      }
      if (!passwordMatches) {
        return res.status(401).json({ message: "Email ou mot de passe invalide." });
      }

      const token = jwt.sign(
        { id: utilisateur.id, nom: utilisateur.nom, email: utilisateur.email }, 
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        token,
        utilisateur: {
          id: utilisateur.id,
          nom: utilisateur.nom,
          email: utilisateur.email,
        },
      });
    }
  );
});


router.get("/me", verifyToken, (req, res) => {
  db.query(
    "SELECT id, nom, email FROM utilisateurs WHERE id = ?",
    [req.utilisateur.id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ message: "Utilisateur introuvable." });
      }
      res.json(results[0]);
    }
  );
});

module.exports = router;
