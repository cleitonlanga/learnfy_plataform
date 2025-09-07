import express from "express";
import cors from "cors";
import {
  errorHandler,
  notFound,
} from "./middlewares/errorHandler.middlewares.js";

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});


//Middlewares
app.use(notFound());
app.use(errorHandler());

export default app;
