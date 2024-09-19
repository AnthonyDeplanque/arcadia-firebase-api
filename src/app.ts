import express from "express";
import cors from "cors";
import { router } from "./router";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

router(app);

app.listen(port, () => {
  console.log(`API lancée sur port ${port}`);
});
