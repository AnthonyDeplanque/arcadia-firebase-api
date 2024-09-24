import { Router } from 'express';
import multer from "multer";
import { ImageController } from '../controllers/images';
const upload = multer({ dest: 'uploads/' }); // Stockage temporaire avant upload Cloudinary

const controller = new ImageController("images")
export const imageRouter = Router ()

// Dans tes routes Express :
imageRouter.post('/', upload.single('image'), controller.addImage);
imageRouter.get("/", controller.getAllImages)
imageRouter.get("/:id", controller.getImageById)
imageRouter.delete("/:id", controller.deleteImageById)