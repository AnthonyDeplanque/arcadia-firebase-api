import { Router } from "express";
import { UserController } from "../controllers/user";

const controller = new UserController("users");

export const userRouter = Router();

userRouter.post("/", controller.postUser);
userRouter.get("/:id", controller.getOneUser);
userRouter.get("/", controller.getUsers);
userRouter.delete("/:id", controller.deleteUser);
userRouter.put("/:id", controller.updateUser);
userRouter.post("/login", controller.loginUser);
