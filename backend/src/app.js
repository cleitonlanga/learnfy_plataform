import express from "express";
import cors from "cors";
import {
  errorHandler,
  notFound,
} from "./middlewares/errorHandler.middlewares.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

//Middlewares
app.use(notFound());
app.use(errorHandler());

export default app;
