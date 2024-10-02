import { Request, Response } from "express";
import { admin } from "../firebase-config";
import { checkRequiredFields } from "../helpers/check-required-fields";
import { getRoleAndRenewToken } from "../middleware/auth-middleware";
import { errorHandler } from "../middleware/errorHandler";
import { Service } from "../interfaces/service";

export class ServiceController {
  private db;
  private collection;
  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);
  }

  public getServices = async (req: Request, res: Response) => {
    try {
      const serviceSnapshot = await this.collection.get();
      if (serviceSnapshot.empty) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const services: Service[] = serviceSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Service),
      }));
      return res.status(200).json(services);
    } catch (error) {
      return errorHandler(res, error);
    }
  };

  public getOneService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const serviceSnapshot = await this.collection.doc(id).get();
      if (!serviceSnapshot) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const service = serviceSnapshot.data() as Service;

      await this.collection.doc(id).update({ ...service });
      return res.status(200).json({ id, ...service });
    } catch (error) {
      return errorHandler(res);
    }
  };

  public postService = async (req: Request, res: Response) => {
    const service = req.body;
    try {
      const requiredFields = ["nom", "description"];
      const error = checkRequiredFields(service, requiredFields);
      if (error) {
        return errorHandler(res, error, 403);
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.add({ ...service });

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

  public putService = async (req: Request, res: Response) => {
    const { id } = req.params;
    const service: Partial<Service> = req.body;

    try {
      const serviceSnapshot = await this.collection.doc(id).get();
      if (!serviceSnapshot) {
        return res.status(404).send("SERVICE INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).update(service);
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

  public deleteService = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const serviceSnapshot = await this.collection.doc(id).get();
      if (!serviceSnapshot.exists) {
        return res.status(403).send("SERVICE INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const { user, newToken: token } = res.locals;
        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).delete();
        return res.status(203).json({
          message: `service supprimé avec succès ${id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  };
}
