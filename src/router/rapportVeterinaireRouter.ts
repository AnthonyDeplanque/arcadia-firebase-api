import { Router } from "express";
import { RapportController } from "../controllers/rapportVeterinaire";

const controller = new RapportController("rapports_veterinaire");

export const rapportRouter = Router();

rapportRouter.get("/", controller.getRapports);
rapportRouter.get("/:id", controller.getOneRapport);
rapportRouter.post("/", controller.postRapport);
rapportRouter.put("/:id", controller.putRapport);
rapportRouter.delete("/:id", controller.deleteRapport);
