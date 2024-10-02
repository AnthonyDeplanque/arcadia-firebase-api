import { Request, Response } from "express";
import { admin } from "../firebase-config";
import { checkRequiredFields } from "../helpers/check-required-fields";
import { getRoleAndRenewToken } from "../middleware/auth-middleware";
import { errorHandler } from "../middleware/errorHandler";
import { Rapport } from "../interfaces/rapportVeterinaire";

export class RapportController {
  private db;
  private collection;
  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);
  }

  public getRapports = async (req: Request, res: Response) => {
    try {
      const rapportSnapshot = await this.collection.get();
      if (rapportSnapshot.empty) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const rapports: Rapport[] = rapportSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Rapport),
      }));
      return res.status(200).json(rapports);
    } catch (error) {
      return errorHandler(res, error);
    }
  };

  public getOneRapport = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const rapportSnapshot = await this.collection.doc(id).get();
      if (!rapportSnapshot) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const rapport = rapportSnapshot.data() as Rapport;

      await this.collection.doc(id).update({ ...rapport });
      return res.status(200).json({ id, ...rapport });
    } catch (error) {
      return errorHandler(res);
    }
  };

  public postRapport = async (req: Request, res: Response) => {
    const rapport = req.body;
    try {
      const requiredFields = ["nom", "description"];
      const error = checkRequiredFields(rapport, requiredFields);
      if (error) {
        return errorHandler(res, error, 403);
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0 || user.role !== 1) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.add({ ...rapport });

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

  public putRapport = async (req: Request, res: Response) => {
    const { id } = req.params;
    const rapport: Partial<Rapport> = req.body;

    try {
      const rapportSnapshot = await this.collection.doc(id).get();
      if (!rapportSnapshot) {
        return res.status(404).send("rapport INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0 || user.role !== 1) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).update(rapport);
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

  public deleteRapport = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const rapportSnapshot = await this.collection.doc(id).get();
      if (!rapportSnapshot.exists) {
        return res.status(403).send("rapport INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const { user, newToken: token } = res.locals;
        if (user.role !== 0 || user.role !== 1) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).delete();
        return res.status(203).json({
          message: `rapport supprimé avec succès ${id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  };
}
