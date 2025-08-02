const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, `${uniqueSuffix}-${file.originalname}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
		cb(null, true);
	} else {
		cb(new Error("File harus berformat .xlsx"), false);
	}
};

const upload = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	fileFilter,
});

module.exports = upload;