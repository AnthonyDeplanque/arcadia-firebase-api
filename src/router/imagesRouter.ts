import { Router } from "express";
import { ImageController } from "../controllers/images";

const controller = new ImageController("images");
export const imageRouter = Router();

/**
 * @swagger
 * /image:
 *   post:
 *     summary: Upload une nouvelle image
 *     responses:
 *       201:
 *         description: Image uploadée avec succès
 */
imageRouter.post("/", controller.uploadImage(), controller.postImage);

/**
 * @swagger
 * /image:
 *   get:
 *     summary: Récupère toutes les images
 *     responses:
 *       200:
 *         description: Liste des images
 */
imageRouter.get("/", controller.getAllImages);

/**
 * @swagger
 * /image/{id}:
 *   get:
 *     summary: Récupère une image par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'image
 *     responses:
 *       200:
 *         description: Détails de l'image
 */
imageRouter.get("/:id", controller.getImageById);

/**
 * @swagger
 * /image/{id}:
 *   delete:
 *     summary: Supprime une image par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'image
 *     responses:
 *       200:
 *         description: Image supprimée avec succès
 */
imageRouter.delete("/:id", controller.deleteImageById);
