const validateRequest = (schema) => {
  return (req, res, next) => {
    // Validate the request body against the provided schema
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((detail) => detail.message) });
    }
    next();
  };
};
