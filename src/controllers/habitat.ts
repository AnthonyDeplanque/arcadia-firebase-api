import { Request, Response } from "express";
import { admin } from "../firebase-config";
import { Habitat } from "../interfaces/habitat";
import { getRoleAndRenewToken } from "../middleware/auth-middleware";
import { errorHandler } from "../middleware/errorHandler";

export class HabitatController {
  private db;
  private collection;
  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);
  }

  public getHabitat = async (_req: Request, res: Response) => {
    try {
      const habitatSnapshot = await this.collection.get();
      if (habitatSnapshot.empty) {
        return res.status(203).json({ message: "Pas de données" });
      }
      const habitats: Habitat[] = habitatSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Habitat),
      }));
      return res.status(200).json(habitats);
    } catch (error) {
      return errorHandler(res);
    }
  };
  public getOneHabitat = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const habitatSnapshot = await this.collection.doc(id).get();
      if (!habitatSnapshot) {
        return res.status(203).json({ message: "Pas de données" });
      }
      const habitat = habitatSnapshot.data() as Habitat;
      return res.status(200).json({ id, ...habitat });
    } catch (error) {
      return errorHandler(res);
    }
  };
  public postHabitat = async (req: Request, res: Response) => {
    const habitat = req.body; // Récupération des données du corps de la requête.
    try {
      // Vérification que tous les champs requis sont présents.
      const requiredFields = ["nom", "description", "commentaire"];
      for (const field of requiredFields) {
        if (habitat[field] === undefined) {
          console.log(field, habitat[field]);
          return res.status(403).send(`${field} est manquant`); // Si un champ obligatoire est manquant, on renvoie un message d'erreur.
        } else continue;
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        console.log(user, token);

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }

        const docRef = await this.collection.add(habitat);

        return res.status(200).json({
          message: `document ajouté avec id : ${docRef.id}`, // Retourne l'ID du document ajouté.
          data: docRef,
          token,
        });
      });
      // Déstructuration des données reçues.
    } catch (error) {
      return errorHandler(res);
    }
  };

  public putHabitat = async (req: Request, res: Response) => {
    const { id } = req.params;
    const habitat:Partial<Habitat> = req.body;
    try {
      const habitatSnapshot = await this.collection.doc(id).get();
      if (habitatSnapshot.exists) {
        getRoleAndRenewToken(req, res, async () => {
          const user = res.locals.user;
          const token = res.locals.newToken;

          if (user.role !== 0) {
            return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
          }
          const docRef = await this.collection.doc(id).update(habitat);
          return res.status(200).json({
            message: `document mis à jour avec id : ${id}`, // Retourne l'ID du document ajouté.
            data: docRef,
            token,
          });
        });
      } else {
        return res.status(404).send("HABITAT INTROUVABLE");
      }
    } catch (error) {
      return errorHandler(res);
    }
  };

  public deleteHabitat = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const habitatSnapshot = await this.collection.doc(id).get();
      if (habitatSnapshot.exists) {
      getRoleAndRenewToken(req, res, async () => {
          const user = res.locals.user;
          const token = res.locals.newToken;

          if (user.role !== 0) {
            return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
          }
          const docRef = await this.collection.doc(id).delete();
          return res.status(203).json({
            message: `Habitat supprimé avec succès ${id}`,
            data: docRef,
            token,
          });
        });
      } else {
        return res.status(403).send("HABITAT INTROUVABLE");
      }
    } catch (error) {
      return errorHandler(res);
    }
  };

  public addImagesToHabitat = async (req: Request, res: Response) => {
    const { id } = req.params;
    const images: string[] = req.body;
  
    if (!Array.isArray(images)) {
      return res.status(400).send("Les données fournies ne sont pas valides.");
    }
  
    try {
      const habitatSnapshot = await this.collection.doc(id).get();
      if (!habitatSnapshot.exists) {
        return res.status(404).send("Pas de données.");
      }
  
      const habitat: Partial<Habitat> = habitatSnapshot.data() as Habitat;
      habitat.images_id = habitat.images_id || []; // Initialiser si undefined
      images.forEach(image => habitat.images_id!.push(image)); // On peut maintenant utiliser 'push'
  
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;
  
        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
  
        await this.collection.doc(id).update({ images_id: habitat.images_id });
        return res.status(200).json({
          message: `Document mis à jour avec id : ${id}`,
          token,
        });
      });
  
    } catch (error) {
      return errorHandler(res);
    }
  };
  
  public removeImagesToHabitat = async (req: Request, res: Response) => {
    const { id } = req.params;
    const images: string[] = req.body;
  
    if (!Array.isArray(images)) {
      return res.status(400).send("Les données fournies ne sont pas valides.");
    }
  
    try {
      const habitatSnapshot = await this.collection.doc(id).get();
      if (!habitatSnapshot.exists) {
        return res.status(404).send("Pas de données.");
      }
  
      const habitat: Partial<Habitat> = habitatSnapshot.data() as Habitat;
  
      if (habitat.images_id) {
        habitat.images_id = habitat.images_id.filter(image => !images.includes(image));
      } else {
        return res.status(400).send("Pas d'images à supprimer.");
      }
  
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;
  
        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
  
        await this.collection.doc(id).update({ images_id: habitat.images_id });
        return res.status(200).json({
          message: `Document mis à jour avec id : ${id}`,
          token,
        });
      });
  
    } catch (error) {
      return errorHandler(res);
    }
  };
}
