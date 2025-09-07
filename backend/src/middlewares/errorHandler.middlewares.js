import dotenv from "dotenv";
dotenv.config();
export const errorHandler = () => {
  return (err, req, res, next) => {
    try {
      console.error("Error:", err);
      const statusCode = err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      return res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
      });
    } catch (error) {
      console.error("Error in error handler middleware:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

export const notFound = () => {
  return (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
};
