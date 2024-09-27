import { Router } from "express";
import { AnimalController } from "../controllers/animal";

const controller = new AnimalController("animals");

export const animalRouter = Router();

/**
 * @swagger
 * /animal:
 *   get:
 *     summary: Récupère tous les animaux
 *     responses:
 *       200:
 *         description: Liste des animaux
 */
animalRouter.get("/", controller.getAnimals);

/**
 * @swagger
 * /animal/{id}:
 *   get:
 *     summary: Récupère un animal par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'animal
 *     responses:
 *       200:
 *         description: Détails de l'animal
 */
animalRouter.get("/:id", controller.getOneAnimal);

/**
 * @swagger
 * /animal:
 *   post:
 *     summary: Crée un nouvel animal
 *     responses:
 *       201:
 *         description: Animal créé avec succès
 */
animalRouter.post("/", controller.postAnimal);

/**
 * @swagger
 * /animal/{id}:
 *   put:
 *     summary: Met à jour un animal par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'animal
 *     responses:
 *       200:
 *         description: Animal mis à jour
 */
animalRouter.put("/:id", controller.putAnimal);

// Ajout et suppression d'images à un animal
animalRouter.put("/images/:id", controller.addImagesToAnimal);
animalRouter.put("/images/:id", controller.removeImagesToAnimal);

/**
 * @swagger
 * /animal/{id}:
 *   delete:
 *     summary: Supprime un animal par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'animal
 *     responses:
 *       200:
 *         description: Animal supprimé avec succès
 */
animalRouter.delete("/:id", controller.deleteAnimal);
