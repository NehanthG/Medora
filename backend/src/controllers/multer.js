import multer from "multer";

// Store files in memory before saving to MongoDB
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;

