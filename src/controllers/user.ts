import { NextFunction, Request, Response } from "express"; // Importation des types pour les requêtes, réponses, et la fonction next dans Express.
import { admin } from "../firebase-config"; // Importation de l'instance Firebase admin pour accéder à la base de données Firestore.
import { User, UserInsertion, UserResponse } from "../interfaces/user"; // Importation des interfaces pour typer les utilisateurs.
import argon2 from "argon2"; // Importation de la librairie argon2 pour hasher et vérifier les mots de passe.
import { authMiddleware } from "../middleware/auth-middleware"; // Importation du middleware d'authentification.
import { generateToken } from "../helpers/json-web-token"; // Importation de la fonction pour générer des tokens JWT.

export class UserController {
  private db; // Instance de la base de données Firestore.
  private collection; // Collection Firestore spécifique à ce contrôleur.

  constructor(collection: string) {
    this.db = admin.firestore(); // Initialisation de la base de données Firestore.
    this.collection = this.db.collection(collection); // Sélection de la collection Firestore où seront stockés les utilisateurs.
  }

  // Méthode pour créer un nouvel utilisateur dans Firestore.
  public postUser = async (req: Request, res: Response) => {
    const data = req.body; // Récupération des données du corps de la requête.

    // Vérification que tous les champs requis sont présents.
    const requiredFields = ["username", "password", "nom", "prenom", "role_id"];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        console.log(field, data[field]);
        return res.status(403).send(`${field} est manquant`); // Si un champ est manquant, on renvoie un message d'erreur.
      } else continue;
    }

    const { username, password, nom, prenom, role_id } = data; // Déstructuration des données reçues.

    // Hashage du mot de passe avec argon2.
    const hashed_password = await argon2.hash(password);

    // const role_id = 2;
    // Création de l'objet utilisateur à insérer dans Firestore.
    const user: UserInsertion = {
      username,
      nom,
      prenom,
      role_id,
      hashed_password, // Le mot de passe est stocké hashé pour plus de sécurité.
    };

    // Vérification si l'utilisateur existe déjà dans la base de données.
    const alreadyExistingUser = await this.getUserByUsername(username);

    if (alreadyExistingUser) {
      return res.status(403).send("Un utilisateur avec ce pseudo existe déjà"); // Si un utilisateur existe déjà avec ce pseudo, on renvoie un message d'erreur.
    }
    try {
      // Ajout de l'utilisateur dans Firestore.
      const docRef = await this.collection.add(user);
      return res.status(200).json({
        message: `document ajouté avec id :${docRef.id}`, // Retourne l'ID du document ajouté.
        data: docRef,
      });
    } catch (error) {
      return res
        .status(500)
        .send(`Erreur lors de l'ajout du document, ${error}`); // Gestion des erreurs liées à l'insertion de données.
    }
  };

  // Méthode pour récupérer tous les utilisateurs de la collection Firestore.
  public getUsers = async (req: Request, res: Response) => {
    try {
      const usersSnapshot = await this.collection.get(); // Récupération de tous les documents de la collection.
      if (usersSnapshot.empty) {
        return res.status(203).json({ message: "Pas de données" }); // Si la collection est vide, renvoie un code 203 (No Content).
      } else {
        // Transformation des documents en tableau d'utilisateurs.
        const users: UserResponse[] = usersSnapshot.docs.map(
          (doc): UserResponse => {
            const data: UserResponse = doc.data() as UserResponse;
            data.id = doc.id; // Ajout de l'ID du document aux données de l'utilisateur.
            return { ...data };
          }
        );

        return res.status(200).json(users); // Retourne la liste des utilisateurs.
      }
    } catch (error) {
      return res.status(500).send("Erreur lors de la récupération des données"); // Gestion des erreurs lors de la récupération des utilisateurs.
    }
  };

  // Méthode pour récupérer un utilisateur spécifique par son ID.
  public getOneUser = async (req: Request, res: Response) => {
    const { id } = req.params; // Récupération de l'ID de l'utilisateur à partir des paramètres de la requête.
    try {
      const usersSnapshot = await this.collection.doc(id).get(); // Récupération du document utilisateur par son ID.
      if (!usersSnapshot.exists) {
        return res.status(404).send("Utilisateur non trouvé"); // Si l'utilisateur n'existe pas, renvoie un message d'erreur.
      }
      const users: UserResponse = {
        id,
        ...usersSnapshot.data(),
      } as UserResponse; // Ajout de l'ID dans la réponse utilisateur.
      return res.status(200).json([users]); // Retourne l'utilisateur.
    } catch (error) {
      return res.status(500).send("Erreur lors de la récupération des données"); // Gestion des erreurs lors de la récupération des données.
    }
  };

  // Méthode pour supprimer un utilisateur par son ID.
  public deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params; // Récupération de l'ID de l'utilisateur à supprimer.
    UserController.verifyUserByTokenForUserController(req, res, async () => {
      try {
        const usersSnapshot = await this.collection.doc(id).get(); // Récupération du document utilisateur.
        if (!usersSnapshot.exists) {
          return res.status(203).send("pas d'enregistrement"); // Si l'utilisateur n'existe pas, on renvoie une réponse 203.
        } else {
          const userDelete = await this.collection.doc(id).delete(); // Suppression de l'utilisateur.
          return res.status(203).json({ message: "Effacement OK", userDelete }); // Retourne une confirmation de la suppression.
        }
      } catch (error) {
        return res
          .status(500)
          .send("Erreur lors de la suppression des données"); // Gestion des erreurs lors de la suppression.
      }
    });
  };

  // Méthode pour mettre à jour un utilisateur par son ID.
  public updateUser = async (req: Request, res: Response) => {
    const { id } = req.params; // Récupération de l'ID de l'utilisateur à mettre à jour.
    const updatedData: Partial<User> = req.body; // Données à mettre à jour.

    await UserController.verifyUserByTokenForUserController(
      req,
      res,
      async () => {
        if (updatedData.username) {
          return res
            .status(403)
            .send("Il est interdit de changer son nom d'utilisateur"); // Empêche la mise à jour du nom d'utilisateur.
        }
        try {
          const usersSnapshot = await this.collection.doc(id).get(); // Récupération de l'utilisateur.
          if (!usersSnapshot) {
            return res.status(203).send("pas d'enregistrement"); // Si l'utilisateur n'existe pas, on renvoie une réponse 203.
          } else {
            const userUpdate = await this.collection
              .doc(id)
              .update(updatedData); // Mise à jour des données utilisateur.
            return res.status(200).json({
              message: "Mise à jour OK", // Retourne une confirmation de la mise à jour.
              userUpdate,
              token: res.locals.newToken, // Ajoute le nouveau token dans la réponse.
            });
          }
        } catch (error) {
          return res
            .status(500)
            .send("Erreur lors de la mise à jour des données"); // Gestion des erreurs lors de la mise à jour.
        }
      }
    );
  };

  // Méthode privée pour récupérer un utilisateur par son nom d'utilisateur.
  private getUserByUsername = async (
    username: string
  ): Promise<UserResponse | null> => {
    const usersSnapshot = await this.collection
      .where("username", "==", username)
      .get(); // Récupération de l'utilisateur en fonction du nom d'utilisateur.

    if (usersSnapshot.empty) {
      return null; // Si aucun utilisateur n'est trouvé, renvoie null.
    }
    const user = usersSnapshot.docs[0].data() as Required<UserInsertion>; // Récupération des données utilisateur.
    const id = usersSnapshot.docs[0].id; // Récupération de l'ID du document utilisateur.
    return { id, ...user }; // Retourne l'utilisateur avec son ID.
  };

  // Middleware pour vérifier l'utilisateur avec un token JWT.
  private static verifyUserByTokenForUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params; // Récupération de l'ID de l'utilisateur.
    const userDecodedToken = authMiddleware(req); // Vérification du token JWT.
    if (typeof userDecodedToken === "string") {
      if (userDecodedToken === "NO TOKEN") {
        return res.status(403).send("PAS DE TOKEN"); // Si aucun token n'est présent.
      }
      if (userDecodedToken === "INVALID TOKEN") {
        return res.status(403).send("TOKEN INVALIDE"); // Si le token est invalide.
      }
    } else {
      if (userDecodedToken.role !== 0 && userDecodedToken.id !== id) {
        // role 0 === Admin
        return res
          .status(403)
          .send(
            "Il est interdit de changer les données d'un autre utilisateur"
          ); // Si l'utilisateur essaie de modifier les données d'un autre utilisateur sans en avoir l'autorisation.
      }
    }
    const newToken = generateToken(
      (userDecodedToken as { id: string; role: number }).id,
      (userDecodedToken as { id: string; role: number }).role
    ); // Génération d'un nouveau token.
    res.locals.newToken = newToken; // Stockage du nouveau token dans `res.locals`.
    next(); // Passe à la prochaine fonction middleware.
  };

  // Méthode pour connecter un utilisateur et renvoyer un token JWT.
  public loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body; // Récupération du nom d'utilisateur et du mot de passe.
    try {
      const user = await this.getUserByUsername(username); // Recherche de l'utilisateur par nom d'utilisateur.
      if (!user) {
        return res.status(404).send("Utilisateur non trouvé"); // Si l'utilisateur n'est pas trouvé.
      }
      const match = await argon2.verify(user?.hashed_password!, password); // Vérification du mot de passe hashé.
      if (!match) {
        return res.status(403).send("Mauvais mot de passe"); // Si le mot de passe ne correspond pas.
      }

      const token = generateToken(user?.id!, user?.role_id!); // Génération d'un token JWT.
      return res.status(200).json({ user, token }); // Retourne l'utilisateur et le token.
    } catch (error) {
      return res.status(403).send("Erreur serveur"); // Gestion des erreurs lors de la connexion.
    }
  };
}
