import { Router } from "express";
import { RaceController } from "../controllers/race";

const controller = new RaceController("races");

export const raceRouter = Router();

raceRouter.get("/", controller.getRaces);
raceRouter.get("/:id", controller.getOneRace);
raceRouter.post("/", controller.postRace);
raceRouter.put("/:id", controller.putRace);
raceRouter.delete("/:id", controller.deleteRace);
