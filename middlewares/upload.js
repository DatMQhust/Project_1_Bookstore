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
//   limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn dung lượng file 5MB
//   fileFilter: (req, file, cb) => {
//     // Chỉ chấp nhận các định dạng ảnh: jpg, jpeg, png
//     const fileTypes = /jpeg|jpg|png/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = fileTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only .jpg, .jpeg, .png images are allowed!'));
//     }
//   }
});

module.exports = upload;
