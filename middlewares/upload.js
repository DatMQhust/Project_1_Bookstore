// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất dựa trên thời gian hiện tại và phần mở rộng gốc của file
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Middleware multer
const upload = multer({ 
  storage: storage
});

module.exports = upload;
