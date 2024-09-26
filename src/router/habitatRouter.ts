import { Router } from "express";
import { HabitatController } from "../controllers/habitat";

const controller = new HabitatController("habitats");

export const habitatRouter = Router();

habitatRouter.get("/", controller.getHabitats);
habitatRouter.get("/:id", controller.getOneHabitat);
habitatRouter.post("/", controller.postHabitat);
habitatRouter.put("/:id", controller.putHabitat);
habitatRouter.put("/images/:id", controller.addImagesToHabitat);
habitatRouter.put("/images/:id", controller.removeImagesToHabitat);
habitatRouter.delete("/:id", controller.deleteHabitat);
