import { Response } from "express";

export const errorHandler = (
  res: Response,
  message: string = "Erreur lors de la création des données"
) => {
  return res.status(500).send(message);
};
