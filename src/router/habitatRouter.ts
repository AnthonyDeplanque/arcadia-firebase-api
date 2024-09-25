import { Router } from "express";
import { HabitatController } from "../controllers/habitat";

export const controller = new HabitatController("habitats");

export const habitatRouter = Router();

habitatRouter.get("/", controller.getHabitats);
habitatRouter.get("/:id", controller.getOneHabitat);
habitatRouter.post("/", controller.postHabitat);
habitatRouter.put("/:id", controller.putHabitat);
habitatRouter.delete("/:id", controller.deleteHabitat);
