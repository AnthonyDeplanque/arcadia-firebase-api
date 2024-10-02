import { Request, Response } from "express";
import { admin } from "../firebase-config";
import { errorHandler } from "../middleware/errorHandler";
import { checkRequiredFields } from "../helpers/check-required-fields";
import { getRoleAndRenewToken } from "../middleware/auth-middleware";
import { Race } from "../interfaces/race";

export class RaceController {
  private db;
  private collection;
  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);
  }

  public getRaces = async (req: Request, res: Response) => {
    try {
      const raceSnapshot = await this.collection.get();
      if (raceSnapshot.empty) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const races: Race[] = raceSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Race),
      }));
      return res.status(200).json(races);
    } catch (error) {
      return errorHandler(res, error);
    }
  };

  public getOneRace = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const raceSnapshot = await this.collection.doc(id).get();
      if (!raceSnapshot) {
        return res.status(404).json({ message: "Pas de données" });
      }
      const race = raceSnapshot.data() as Race;

      await this.collection.doc(id).update({ ...race });
      return res.status(200).json({ id, ...race });
    } catch (error) {
      return errorHandler(res);
    }
  };

  public postRace = async (req: Request, res: Response) => {
    const race = req.body;
    try {
      const requiredFields = [
        "nom_commun",
        "nom_scientifique",
        "type_habitat",
        "famille",
        "origine",
      ];
      const error = checkRequiredFields(race, requiredFields);
      if (error) {
        return errorHandler(res, error, 403);
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.add({ ...race });

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

  public putRace = async (req: Request, res: Response) => {
    const { id } = req.params;
    const race: Partial<Race> = req.body;

    try {
      const raceSnapshot = await this.collection.doc(id).get();
      if (!raceSnapshot) {
        return res.status(404).send("Race INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).update(race);
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

  public deleteRace = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const raceSnapshot = await this.collection.doc(id).get();
      if (!raceSnapshot.exists) {
        return res.status(403).send("RACE INTROUVABLE");
      }
      getRoleAndRenewToken(req, res, async () => {
        const { user, newToken: token } = res.locals;
        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }
        const docRef = await this.collection.doc(id).delete();
        return res.status(203).json({
          message: `Race supprimé avec succès ${id}`,
          data: docRef,
          token,
        });
      });
    } catch (error) {
      return errorHandler(res, error);
    }
  };
}
