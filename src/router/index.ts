import { Application, Request, Response } from "express";
import { habitatRouter } from "./habitatRouter";
import { imageRouter } from "./imagesRouter";
import { userRouter } from "./userRouter";

export const router = (app: Application) => {
  app.use("/user", userRouter);
  app.use("/habitat", habitatRouter);
  app.use("/image");

  app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello World !");
  });
};
