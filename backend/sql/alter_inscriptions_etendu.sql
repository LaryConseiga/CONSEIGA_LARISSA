-- Colonnes optionnelles pour l’inscription via classe (numéro, paiement, lien classe).
-- À exécuter une fois sur la base `gestion-2ie` si ces colonnes n’existent pas encore.

ALTER TABLE `inscriptions`
  ADD COLUMN `classes_id` int DEFAULT NULL COMMENT 'FK logique vers classes / classe' AFTER `parcours_id`,
  ADD COLUMN `numero_inscription` varchar(50) DEFAULT NULL AFTER `dateInscription`,
  ADD COLUMN `statut_paiement` varchar(80) DEFAULT NULL AFTER `numero_inscription`;
