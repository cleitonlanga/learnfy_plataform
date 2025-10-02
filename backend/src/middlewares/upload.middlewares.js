// middlewares/upload.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({ // where to store the files
  destination: (req, file, cb) => {
    cb(null, "../uploads/tmp/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename.replace(/\s+/g, "_"));
  },
});

const upload = multer({ // how to store the files
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".mp3", ".wav", ".m4a", ".mp4", ".mov", ".mkv", ".avi"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(
        new Error("Formato inválido. Aceito: mp3, wav, m4a, mp4, mov, mkv, avi")
      );
    }
    cb(null, true);
  },
});

export default upload;
