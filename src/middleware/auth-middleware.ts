import { Request } from "express"; // Importation de l'interface Request d'Express pour typer les requêtes.
import { verifyToken } from "../helpers/json-web-token"; // Importation de la fonction verifyToken, qui vérifie un token JWT.
import { JwtPayload } from "jsonwebtoken"; // Importation de l'interface JwtPayload de jsonwebtoken pour typer le payload JWT.

export const authMiddleware = (
  req: Request
): string | { id: string; role: number } => {
  // Cette fonction middleware retourne soit une chaîne de caractère si l'authentification échoue, soit un objet contenant l'id de l'utilisateur et son rôle.

  const authHeader = req.headers.authorization; // Récupération de l'en-tête Authorization de la requête.

  // Vérification de la présence de l'en-tête Authorization et si elle commence par "Bearer ".
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return "NO TOKEN"; // Si l'en-tête est manquante ou mal formatée, on retourne "NO TOKEN".
  }

  const token = authHeader.split(" ")[1]; // Extraction du token après le mot "Bearer" en le séparant par un espace.

  try {
    // On essaie de vérifier et décoder le token JWT.
    const decoded = verifyToken(token) as JwtPayload | null; // On décode le token et on le cast en JwtPayload. Si le token est invalide, la fonction renverra null.

    if (!decoded) {
      return "INVALID TOKEN"; // Si le token ne peut pas être décodé ou est invalide, on retourne "INVALID TOKEN".
    }

    // Extraction des champs `id` et `role` du payload décodé du token JWT.
    const { id, role } = decoded as { id: string; role: number }; // On s'assure que les propriétés `id` et `role` existent dans le payload décodé.

    // Vérification de la validité de `id` et `role`.
    if (!id || role === undefined) {
      return "INVALID TOKEN"; // Si `id` ou `role` ne sont pas valides, on retourne "INVALID TOKEN".
    }

    // Si tout est correct, on retourne un objet contenant l'id de l'utilisateur et son rôle.
    return { id, role };
  } catch (error) {
    return "INVALID TOKEN"; // Si une erreur survient lors de la vérification du token (ex: mauvaise signature), on retourne "INVALID TOKEN".
  }
};
