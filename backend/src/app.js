import express from "express";
import cors from "cors";
import {
  errorHandler,
  notFound,
} from "./middlewares/errorHandler.middlewares.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import passport from "./config/passport.js";
import videoRoutes from "./routes/video.routes.js";
import { setupSwagger } from "../documentation/swagger.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
// Swagger
setupSwagger(app);

//Middlewares
app.use(notFound());
app.use(errorHandler());



export default app;
