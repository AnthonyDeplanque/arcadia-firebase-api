import { Application, Request, Response } from "express";
import { userRouter } from "./userRouter";

export const router = (app: Application) => {
  app.use("/user", userRouter);
  app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello World !");
  });
};
