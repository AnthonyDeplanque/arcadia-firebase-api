import { Router } from "express";
import { ServiceController } from "../controllers/services";

const controller = new ServiceController("services");

export const serviceRouter = Router();

serviceRouter.get("/", controller.getServices);
serviceRouter.get("/:id", controller.getOneService);
serviceRouter.post("/", controller.postService);
serviceRouter.put("/:id", controller.putService);
serviceRouter.delete("/:id", controller.deleteService);
