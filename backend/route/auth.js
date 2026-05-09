router.get('/me', verifyToken, (req, res) => {
  db.query(
    'SELECT id, nom, email FROM utilisateurs WHERE id = ?',
    [req.utilisateur.id],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      res.json(results[0]);
    }
  );
});