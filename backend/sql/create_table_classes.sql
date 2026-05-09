-- Table attendue par l’API GET/POST /api/classes (à exécuter si elle n’existe pas encore).
-- Adaptez le nom de table (`classes`) si votre schéma utilise un autre identifiant.

CREATE TABLE IF NOT EXISTS `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(120) NOT NULL,
  `filiere_id` int NOT NULL,
  `niveau_id` int NOT NULL,
  `annee_academique_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_classes_filiere` (`filiere_id`),
  KEY `fk_classes_niveau` (`niveau_id`),
  KEY `fk_classes_annee` (`annee_academique_id`),
  CONSTRAINT `fk_classes_filiere` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_classes_niveau` FOREIGN KEY (`niveau_id`) REFERENCES `niveaux` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_classes_annee` FOREIGN KEY (`annee_academique_id`) REFERENCES `anneeacademiques` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
