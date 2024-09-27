import { admin } from "../firebase-config";
import { Request, Response } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { Avis } from "../interfaces/avis";
import { checkRequiredFields } from "../helpers/check-required-fields";
import { getRoleAndRenewToken } from "../middleware/auth-middleware";

export class AvisController {
  private db;
  private collection;

  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);
  }

  public getAvis = async (_req: Request, res: Response) => {
    try {
      const avisSnapshot = await this.collection.get();
      if (avisSnapshot.empty) {
        return res.status(404).json({ message: "pas de données" });
      }
      const avis: Avis[] = avisSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Avis),
      }));
      return res.status(200).json(avis);
    } catch (error) {
      return errorHandler(res, error);
    }
  };

  public getOneAvis = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const avisSnapshot = await this.collection.doc(id).get();
      if (!avisSnapshot) {
        return res.status(404).json({ message: "pas de données" });
      }
      const avis = avisSnapshot.data() as Avis;
      return res.status(200).json({ id, ...avis });
    } catch (error) {
      return errorHandler(res, error);
    }
  };

  public postAvis = async (req: Request, res: Response) => {
    const avis: Partial<Avis> = req.body;
    try {
      const requiredFields = ["pseudo", "commentaire"];
      const error = checkRequiredFields(avis, requiredFields);
      if (error) {
        return errorHandler(res, error, 403);
      }

      const docRef = await this.collection.add({ ...avis, is_visible: false });
      return res.status(200).json({
        message: `document ajouté avec id : ${docRef.id}`,
        data: docRef,
      });
    } catch (error) {
      return errorHandler(res);
    }
  };

  public deleteAvis = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const avisSnapshot = await this.collection.doc(id).get();
      if (!avisSnapshot.exists) {
        return errorHandler(res, "Avis introuvable", 403);
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (!user) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).delete();
        return res.status(203).json({
          message: `avis supprimé avec succès ${id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res);
    }
  };

  public updateVisibilityAvis = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const avisSnapshot = await this.collection.doc(id).get();
      if (!avisSnapshot.exists) {
        return errorHandler(res, "Avis introuvable", 403);
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (!user) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const avis: Avis = avisSnapshot.data() as Avis;
        const visibility = !avis.is_visible;
        const docRef = await this.collection
          .doc(id)
          .update({ ...avis, is_visible: visibility });
        return res.status(203).json({
          message: `avis ${
            visibility ? "affiché" : "caché"
          } avec succès, ${id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res);
    }
  };
}
