export const validateYoutubeUrl = (req, res, next) => {
  const { sourceType, sourceValue } = req.body;
  console.log("Validating URL:", sourceValue);
  console.log("Source Type:", sourceType);

  if (sourceType === "youtube") {
    // Expressão regular para validar URLs do YouTube
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|shorts\/)?[a-zA-Z0-9_-]{11}/;

    if (!youtubeRegex.test(sourceValue)) {
      return res.status(400).json({
        error: "Invalid YouTube URL. Please provide a valid YouTube link.",
      });
    }
  }

  next();
};
