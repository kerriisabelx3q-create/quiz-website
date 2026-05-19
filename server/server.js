require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// === 1. BẢO MẬT HTTP HEADERS (Helmet) ===
// Tự động thêm các header bảo mật tiêu chuẩn (ngăn XSS, clickjacking, sniff MIME...)
app.use(helmet({
  contentSecurityPolicy: false, // Tắt CSP để không chặn assets của React
  crossOriginEmbedderPolicy: false
}));

// === 2. GIỚI HẠN TỐC ĐỘ TRUY CẬP (Rate Limiting) ===
// Toàn trang: tối đa 500 request/15 phút
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { msg: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.' }
});

// Trang đăng nhập: tối đa 20 lần thử/15 phút
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { msg: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.' }
});

app.use(generalLimiter);

// === 3. CORS - Kiểm soát nguồn gốc ===
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép nếu không có origin (server-to-server) hoặc origin nằm trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' })); // Giới hạn payload tối đa 5MB
app.use('/uploads', express.static('uploads'));

// === 4. ÁP DỤNG GIỚI HẠN LOGIN ===
app.use('/api/admin/login', loginLimiter);
app.use('/api/admin/setup', loginLimiter);

// Sync Sequelize
sequelize.sync({ alter: true })
  .then(() => console.log('Database Connected & Synced!'))
  .catch(err => console.error('Failed to sync DB', err));

// Import Routes
app.use('/api', require('./routes/api'));

// Phục vụ giao diện Frontend (React)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// === 5. XỬ LÝ LỖI TOÀN CỤC ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Đã xảy ra lỗi server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
