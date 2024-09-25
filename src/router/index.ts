import { Application, Request, Response } from "express";
import { userRouter } from "./userRouter";
import { habitatRouter } from "./habitatRouter";

export const router = (app: Application) => {
  app.use("/user", userRouter);
  app.use("/habitat", habitatRouter);
  app.use("/image");

  app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello World !");
  });
};
