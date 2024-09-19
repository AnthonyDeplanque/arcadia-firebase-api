import jwt from "jsonwebtoken";

require("dotenv").config();

const env = process.env;

const secretKey = env.SECRET_KEY;

export const verifyToken = (
  token: string
): { id: string; role: number } | null => {
  try {
    if (!secretKey) {
      console.error("Pas de secret key !");
      return null;
    }
    const decoded = jwt.verify(token, secretKey) as unknown as {
      id: string;
      role: number;
    };
    return decoded;
  } catch (error) {
    console.error("Token Invalide ou expiré ", error);
    return null;
  }
};

export const generateToken = (userId: string, role: number): string | null => {
  if (!secretKey) {
    console.error("Pas de secret key !");
    return null;
  }
  const payload = {
    id: userId,
    role: role,
  };
  return jwt.sign(payload, secretKey, { expiresIn: "1d" });
};
