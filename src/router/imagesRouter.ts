import { Router } from "express";
import { ImageController } from "../controllers/images";

const controller = new ImageController("images");
export const imageRouter = Router();

// Dans tes routes Express :
imageRouter.post("/", controller.uploadImage(), controller.postImage);
imageRouter.get("/", controller.getAllImages);
imageRouter.get("/:id", controller.getImageById);
imageRouter.delete("/:id", controller.deleteImageById);
