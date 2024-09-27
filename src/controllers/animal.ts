import { Request, Response } from "express";
import { admin } from "../firebase-config";
import { Animal } from "../interfaces/animal";
import { errorHandler } from "../middleware/errorHandler";
import { checkRequiredFields } from "../helpers/check-required-fields";
import { getRoleAndRenewToken } from "../middleware/auth-middleware";

export class AnimalController {
  private db;
  private collection;
  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);
  }

  public getAnimals = async (req: Request, res: Response) => {
    try {
      const animalSnapshot = await this.collection.get();
      if (animalSnapshot.empty) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const animals: Animal[] = animalSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Animal),
      }));
      return res.status(200).json(animals);
    } catch (error) {
      return errorHandler(res, error);
    }
  };

  public getOneAnimal = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const animalSnapshot = await this.collection.doc(id).get();
      if (!animalSnapshot) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const animal = animalSnapshot.data() as Animal;
      const nbVues = animal.nb_vues ? animal.nb_vues + 1 : 1;

      await this.collection.doc(id).update({ ...animal, nb_vues: nbVues });
      return res.status(200).json({ id, ...animal });
    } catch (error) {
      return errorHandler(res);
    }
  };

  public postAnimal = async (req: Request, res: Response) => {
    const animal = req.body;
    try {
      const requiredFields = ["prenom", "race_id", "habitat_id"];
      const error = checkRequiredFields(animal, requiredFields);
      if (error) {
        return errorHandler(res, error, 403);
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.add({ ...animal, nb_vues: 0 });

        return res.status(200).json({
          message: `document ajouté avec id : ${docRef.id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res);
    }
  };
  public putAnimal = async (req: Request, res: Response) => {
    const { id } = req.params;
    const animal: Partial<Animal> = req.body;

    try {
      const animalSnapshot = await this.collection.doc(id).get();
      if (!animalSnapshot) {
        return res.status(404).send("ANIMAL INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).update(animal);
        return res.status(200).json({
          message: `document mis à jour avec id : ${id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res);
    }
  };
  public deleteAnimal = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const animalSnapshot = await this.collection.doc(id).get();
      if (!animalSnapshot.exists) {
        return res.status(403).send("ANIMAL INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const { user, newToken: token } = res.locals;
        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).delete();
        return res.status(203).json({
          message: `Animal supprimé avec succès ${id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  };
  public addImagesToAnimal = async (req: Request, res: Response) => {
    const { id } = req.params;
    const images: string[] = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).send("Les données fournies ne sont pas valides.");
    }

    try {
      const animalSnapshot = await this.collection.doc(id).get();
      if (!animalSnapshot.exists) {
        return res.status(404).send("Pas de données.");
      }

      const animal: Partial<Animal> = animalSnapshot.data() as Animal;
      animal.images_id = animal.images_id || []; // Initialiser si undefined

      images.forEach((image) => {
        if (animal.images_id?.length && animal.images_id.includes(image)) {
          return;
        }
        animal.images_id!.push(image);
      }); // On peut maintenant utiliser 'push'

      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }

        await this.collection.doc(id).update({ images_id: animal.images_id });
        return res.status(200).json({
          message: `Document mis à jour avec id : ${id}`,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res);
    }
  };
  public removeImagesToAnimal = async (req: Request, res: Response) => {
    const { id } = req.params;
    const images: string[] = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).send("Les données fournies ne sont pas valides");
    }
    try {
      const animalSnapshot = await this.collection.doc(id).get();
      if (!animalSnapshot.exists) {
        return res.status(404).send("pas de données");
      }
      const animal: Partial<Animal> = animalSnapshot.data() as Animal;
      if (animal.images_id) {
        animal.images_id = animal.images_id.filter(
          (image) => !images.includes(image)
        );
      } else {
        return res.status(400).send("Pas d'images à supprimer");
      }

      getRoleAndRenewToken(req, res, async () => {
        const { user, newToken: token } = res.locals;
        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        await this.collection.doc(id).update({ images_id: animal.images_id });
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
