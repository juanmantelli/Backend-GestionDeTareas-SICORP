import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
  "application/vnd.ms-excel",
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const originalName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
      cb(null, originalName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "El archivo supera el tamaño máximo permitido (5MB)." });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

export default upload;