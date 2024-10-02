import { Application, Request, Response } from "express";
import { habitatRouter } from "./habitatRouter";
import { imageRouter } from "./imagesRouter";
import { userRouter } from "./userRouter";
import { uuid } from "../helpers/uuid";
import { animalRouter } from "./animalRouter";
import { avisRouter } from "./avisRouter";
import { rapportRouter } from "./rapportVeterinaireRouter";
import { raceRouter } from "./raceRouter";
import { serviceRouter } from "./serviceRouter";

export const router = (app: Application) => {
  app.use("/user", userRouter);
  app.use("/habitat", habitatRouter);
  app.use("/animal", animalRouter);
  app.use("/image", imageRouter);
  app.use("/avis", avisRouter);
  app.use("/rapport", rapportRouter);
  app.use("/race", raceRouter);
  app.use("/service", serviceRouter);

  app.get("/", (req: Request, res: Response) => {
    console.log(uuid());
    res.status(200).send("Hello World !");
  });
};
