import express from "express";
import cors from "cors";
import { router } from "./router";
import { setupSwagger } from "./swagger";

const app = express();
export const port = 8080;

app.use(express.json());
app.use(cors());

router(app);

setupSwagger(app);

app.listen(port, () => {
  console.log(`API lancée sur port ${port}`);
  console.log(`Swagger docs disponibles sur http://localhost:${port}/api-docs`);
});
