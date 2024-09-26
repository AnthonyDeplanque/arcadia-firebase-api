import { Response } from "express";

export const errorHandler = (
  res: Response,
  message: string | unknown = "Erreur serveur",
  code: number = 500
) => {
  return res.status(code).send(message);
};
