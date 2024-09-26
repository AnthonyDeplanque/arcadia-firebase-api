import { Request, Response } from "express";
import admin from "firebase-admin";
import { Image } from "../interfaces/image";
import multer from "multer";
import cloudinary from "../cloudinary-config";

import fs from "fs";
import { uuid } from "../helpers/uuid";
import { getRoleAndRenewToken } from "../middleware/auth-middleware";

export class ImageController {
  private db;
  private collection;
  private upload;

  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);

    // Multer configuration for local storage
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });

    // Set up Multer instance
    this.upload = multer({ storage });
  }

  public uploadImage = () => this.upload.single("image");

  // Récupérer toutes les images
  public getAllImages = async (req: Request, res: Response) => {
    try {
      const snapshot = await this.collection.get();
      const images = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(images);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des images." });
    }
  };

  // Récupérer une image par ID
  public getImageById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: "Image non trouvée." });
      }
      return res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'image." });
    }
  };

  // Ajouter une image (avec upload sur Cloudinary)
  public postImage = async (req: Request, res: Response) => {
    try {
      const file = req.file;
      console.log(req.file);
      console.log(req.files);
      console.log(req.body);

      if (!file) {
        return res.status(400).json({ message: "Aucun fichier téléchargé." });
      }

      // Valider le fichier (doit être une image)
      if (!file.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Le fichier doit être une image." });
      }

      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }

        // Upload de l'image sur Cloudinary
        const result = await cloudinary.uploader.upload(file.path);

        // Sauvegarde l'image avec son label et son URL dans Firestore
        const newImage: Image = {
          label: req.file?.originalname || uuid(),
          url: result.secure_url,
        };

        // Sauvegarde dans Firebase (l'id est généré automatiquement par Firestore)
        const docRef = await this.collection.add(newImage);

        // Supprimer le fichier temporaire local après upload
        fs.unlink(file.path, (err) => {
          if (err)
            console.error(`Erreur lors de la suppression du fichier : ${err}`);
          return res
            .status(500)
            .send("Erreur lors de la suppression du fichier");
        });

        return res.status(201).json({
          message: "Image téléchargée et stockée avec succès",
          data: { id: docRef.id, ...newImage, token },
        });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Échec du téléchargement de l'image." });
    }
  };

  // Supprimer une image par ID
  public deleteImageById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      getRoleAndRenewToken(req, res, async () => {
        const user = res.locals.user;
        const token = res.locals.newToken;

        if (user.role !== 0) {
          return res.status(403).send("INTERDIT POUR VOTRE RÔLE");
        }

        // Récupérer l'image dans Firestore pour obtenir l'URL Cloudinary
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
          return res.status(404).json({ message: "Image non trouvée." });
        }

        const imageData = doc.data() as Image;
        const publicId = imageData.url.split("/").pop()?.split(".")[0]; // Extraire l'ID public de Cloudinary

        if (!publicId) {
          return res.status(400).json({ message: "Public ID introuvable." });
        }

        // Supprimer l'image de Cloudinary
        await cloudinary.uploader.destroy(publicId).catch((err) => {
          console.error(
            `Erreur lors de la suppression sur Cloudinary : ${err}`
          );
          return res.status(500).json({
            error: "Échec de la suppression de l'image sur Cloudinary.",
          });
        });

        // Supprimer l'image de Firestore
        await this.collection.doc(id).delete();

        return res
          .status(200)
          .json({ message: "Image supprimée avec succès.", token });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Échec de la suppression de l'image." });
    }
  };
}
