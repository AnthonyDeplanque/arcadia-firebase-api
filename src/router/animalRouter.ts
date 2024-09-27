import { Router } from "express";
import { AnimalController } from "../controllers/animal";

const controller = new AnimalController("animals");

export const animalRouter = Router();

animalRouter.get("/", controller.getAnimals);
animalRouter.get("/:id", controller.getOneAnimal);
animalRouter.post("/", controller.postAnimal);
animalRouter.put("/:id", controller.putAnimal);
animalRouter.put("/images/:id", controller.addImagesToAnimal);
animalRouter.put("/images/:id", controller.removeImagesToAnimal);
animalRouter.delete("/:id", controller.deleteAnimal);
