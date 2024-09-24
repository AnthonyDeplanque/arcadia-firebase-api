import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { Image } from '../interfaces/image';

import fs from 'fs';

export class ImageController {
  private db;
  private collection;

  constructor(collection: string) {
    this.db = admin.firestore();
    this.collection = this.db.collection(collection);
  }

  // Récupérer toutes les images
  public getAllImages = async (req: Request, res: Response) => {
    try {
      const snapshot = await this.collection.get();
      const images = snapshot.docs.map(doc => doc.data());
      return res.status(200).json(images);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des images.' });
    }
  };

  // Récupérer une image par ID
  public getImageById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: 'Image non trouvée.' });
      }
      return res.status(200).json(doc.data());
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'image.' });
    }
  };

  // Ajouter une image (avec upload sur Cloudinary)
  public addImage = async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "Aucun fichier téléchargé." });
      }

      // Upload de l'image sur Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'habitat_images',
      });

      // Sauvegarde l'image avec son label et son URL dans Firestore
      const newImage: Image = {
        label: req.body.label,
        url: result.secure_url
      };

      // Sauvegarde dans Firebase (l'id est généré automatiquement par Firestore)
      const docRef = await this.collection.add(newImage);

      // Supprimer le fichier temporaire local
      fs.unlink(file.path, (err) => {
        if (err) console.error('Échec de la suppression du fichier temporaire :', err);
      });

      return res.status(201).json({
        message: 'Image téléchargée et stockée avec succès',
        data: { id: docRef.id, ...newImage }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Échec du téléchargement de l\'image.' });
    }
  };

  // Supprimer une image par ID
  public deleteImageById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      // Récupérer l'image dans Firestore pour obtenir l'URL Cloudinary
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ message: 'Image non trouvée.' });
      }

      const imageData = doc.data() as Image;
      const publicId = imageData.url.split('/').pop()?.split('.')[0]; // Extraire l'ID public de Cloudinary

      // Supprimer l'image de Cloudinary
      await cloudinary.uploader.destroy(publicId!);

      // Supprimer l'image de Firestore
      await this.collection.doc(id).delete();

      return res.status(200).json({ message: 'Image supprimée avec succès.' });
    } catch (error) {
      return res.status(500).json({ error: 'Échec de la suppression de l\'image.' });
    }
  };
}