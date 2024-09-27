import { Router } from "express";
import { UserController } from "../controllers/user";

const controller = new UserController("users");

export const userRouter = Router();

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
userRouter.post("/", controller.postUser);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 */
userRouter.get("/:id", controller.getOneUser);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Récupère tous les utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
userRouter.get("/", controller.getUsers);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Supprime un utilisateur par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 */
userRouter.delete("/:id", controller.deleteUser);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Met à jour un utilisateur par son ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
userRouter.put("/:id", controller.updateUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Authentifie un utilisateur
 *     responses:
 *       200:
 *         description: Authentification réussie
 */
userRouter.post("/login", controller.loginUser);
