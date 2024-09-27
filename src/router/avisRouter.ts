import { Router } from "express";
import { AvisController } from "../controllers/avis";

const controller = new AvisController("avis");

export const avisRouter = Router();
/**
 * @swagger
 * /avis:
 *   get:
 *     summary: Récupère tous les avis
 *     responses:
 *       200:
 *         description: Liste des avis
 */
avisRouter.get("/", controller.getAvis);

/**
 * @swagger
 * /avis:{id}
 *  get:
 *    summary: récupère un avis
 *    responses:
 *      200:
 *        description : un avis
 */
avisRouter.get("/:id", controller.getOneAvis);
/**
 * @swagger
 * /avis:
 *   post:
 *     summary: Crée un nouvel avis
 *     responses:
 *       201:
 *         description: avis créé avec succès
 */
avisRouter.post("/", controller.postAvis);

/**
 * @swagger
 * /avis/{id}:
 *   put:
 *     summary: Met à jour la visibilité d'un avis par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'avis
 *     responses:
 *       200:
 *         description: avis mis à jour
 */
avisRouter.put("/:id", controller.updateVisibilityAvis);

/**
 * @swagger
 * /avis/{id}:
 *   delete:
 *     summary: Supprime un avis par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'avis
 *     responses:
 *       200:
 *         description: avis supprimé avec succès
 */
avisRouter.delete("/:id", controller.deleteAvis);
