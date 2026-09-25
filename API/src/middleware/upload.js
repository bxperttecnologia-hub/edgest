const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// CREATE UPLOADS FOLDER IF NOT EXISTS
// ======================================================
const uploadPath = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ======================================================
// STORAGE
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ======================================================
// FILE FILTER
// ======================================================
const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de ficheiro não suportado"), false);
  }
};

// ======================================================
// EXPORT
// ======================================================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
