import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Robust absolute path
const __dirname = import.meta.dirname;
// Move up two directories from /src/middlewares to root, then into public/temp
const tempDir = path.join(__dirname, '../../public/temp');

// Ensure the directory exists when the server starts
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit CSV/Excel to 10MB
    fileFilter: (req, file, cb) => {
        const filetypes =
            /csv|xlsx|xls|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype || extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports CSV or Excel files!'));
    },
});

export const uploadImages = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit Images to 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype || extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Only images (jpeg, jpg, png, webp) are allowed!'));
    },
});
