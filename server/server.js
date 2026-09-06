require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// === 1. BẢO MẬT HTTP HEADERS (Helmet & Policies) ===
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

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

// === 3. CORS - Kiểm soát nguồn gốc an toàn, không crash 500 ===
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:4173'];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // same-origin or non-browser/server-to-server
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(origin);
};

// Chặn origin lạ trả về 403 Forbidden thay vì throw exception gây lỗi 500
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ msg: 'Origin không được phép truy cập (CORS forbidden).' });
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      // Dùng false thay vì ném Error để không gây unhandled 500 crash
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 204
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
  const os = require('os');
  const nets = os.networkInterfaces();
  console.log('\n======================================================');
  console.log('Hệ thống trắc nghiệm nội bộ đã sẵn sàng!');
  console.log(`- Truy cập tại máy này: http://localhost:${PORT}`);
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`- Truy cập từ máy khác trong mạng LAN: http://${net.address}:${PORT}`);
      }
    }
  }
  console.log('======================================================\n');
});
