import swaggerJSDoc, { Options as SwaggerOptions } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

require("dotenv").config();

const { env } = process;

const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ARCADIA API Documentation",
      version: "1.0.0",
      description: "API de l'application Arcadia",
    },
    servers: [
      {
        url: env.SERVER_ADDRESS,
      },
    ],
  },
  apis: [
    "./src/router/index.ts",
    "./src/router/animalRouter.ts",
    "./src/router/habitatRouter.ts",
    "./src/router/imagesRouter.ts",
    "./src/router/userRouter.ts",
  ],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
