import { Router } from "express";
import { HabitatController } from "../controllers/habitat";

const controller = new HabitatController("habitats");

export const habitatRouter = Router();

/**
 * @swagger
 * /habitat:
 *   get:
 *     summary: Récupère tous les habitats
 *     responses:
 *       200:
 *         description: Liste des habitats
 */
habitatRouter.get("/", controller.getHabitats);

/**
 * @swagger
 * /habitat/{id}:
 *   get:
 *     summary: Récupère un habitat par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'habitat
 *     responses:
 *       200:
 *         description: Détails de l'habitat
 */
habitatRouter.get("/:id", controller.getOneHabitat);

/**
 * @swagger
 * /habitat:
 *   post:
 *     summary: Crée un nouvel habitat
 *     responses:
 *       201:
 *         description: Habitat créé avec succès
 */
habitatRouter.post("/", controller.postHabitat);

/**
 * @swagger
 * /habitat/{id}:
 *   put:
 *     summary: Met à jour un habitat par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'habitat
 *     responses:
 *       200:
 *         description: Habitat mis à jour
 */
habitatRouter.put("/:id", controller.putHabitat);

// Ajout et suppression d'images d'un habitat
habitatRouter.put("/images/:id", controller.addImagesToHabitat);
habitatRouter.put("/images/:id", controller.removeImagesToHabitat);

/**
 * @swagger
 * /habitat/{id}:
 *   delete:
 *     summary: Supprime un habitat par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'habitat
 *     responses:
 *       200:
 *         description: Habitat supprimé avec succès
 */
habitatRouter.delete("/:id", controller.deleteHabitat);
