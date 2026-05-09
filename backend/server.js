const express = require("express");
const cors    = require("cors");
const app     = express();


// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());            // autorise les requêtes depuis React (localhost:5173)
app.use(express.json());    // parse le corps des requêtes en JSON

// ── Routes ────────────────────────────────────────────────────────────────────
const etudiantsRouter = require("./routes/etudiants");
const authRouter      = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");
const ecolesRouter    = require("./routes/ecoles");
const filieresRouter    = require("./routes/filieres");
const specialitesRouter = require("./routes/specialites");
const niveauxRouter     = require("./routes/niveaux");
const cyclesRouter      = require("./routes/cycles");
const anneeAcademiquesRouter = require("./routes/anneeacademiques");
const decisionsRefRouter     = require("./routes/decisions");
const parcoursRouter      = require("./routes/parcours");
const inscriptionsRouter  = require("./routes/inscriptions");
const paysRouter          = require("./routes/pays");
const civilitesRouter     = require("./routes/civilites");
const classesRouter       = require("./routes/classes");
app.use("/api/etudiants", etudiantsRouter);
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ecoles", ecolesRouter);
app.use("/api/filieres", filieresRouter);
app.use("/api/specialites", specialitesRouter);
app.use("/api/niveaux", niveauxRouter);
app.use("/api/cycles", cyclesRouter);
app.use("/api/annee-academiques", anneeAcademiquesRouter);
app.use("/api/decisions", decisionsRefRouter);
app.use("/api/parcours", parcoursRouter);
app.use("/api/inscriptions", inscriptionsRouter);
app.use("/api/pays", paysRouter);
app.use("/api/civilites", civilitesRouter);
app.use("/api/classes", classesRouter);

// ── Démarrage du serveur ──────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 8000;
const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(
            `Le port ${PORT} est déjà utilisé (une autre instance du serveur ?). ` +
                `Sous Windows : netstat -ano | findstr :${PORT} puis taskkill /PID <pid> /F`
        );
    } else {
        console.error(err);
    }
    process.exit(1);
});
