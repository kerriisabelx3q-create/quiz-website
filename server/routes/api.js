const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { sequelize, Admin, Category, Question, SystemConfig, Submission, Message, Document, Library, Topic, TopicCategory } = require('../models');
const multer = require('multer');
const fs = require('fs');

// Ensure uploads dir exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/') },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')) }
});

// Kiểm tra theo phần mở rộng file an toàn
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp'
  ];
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được phép.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,   // 50MB cho file
    fieldSize: 10 * 1024 * 1024,  // 10MB cho text fields
    fields: 20,
    files: 1
  }
});

// Wrapper giúp trả lỗi multer dạng JSON chuẩn 400 thay vì crash server
const uploadSingle = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'File quá lớn! Kích thước tối đa là 50MB.' });
      }
      if (err.code === 'LIMIT_FIELD_VALUE') {
        return res.status(400).json({ msg: 'Dữ liệu form quá lớn.' });
      }
      return res.status(400).json({ msg: err.message || 'Lỗi tải file lên.' });
    }
    next();
  });
};

// === BẢO MẬT: Hàm làm sạch ký tự HTML để chống XSS (OWASP A03) ===
const sanitizeText = (str, maxLength = 2000) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// === BẢO MẬT: Chuẩn hóa phản hồi lỗi máy chủ 500 (OWASP A04) ===
const sendServerError = (res, err, logContext = 'API') => {
  console.error(`[${logContext} ERROR]:`, err?.message || err);
  return res.status(500).json({ msg: 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau.' });
};

// --- AUTH & SETUP ---

// Khóa vĩnh viễn setup sau khi đã có tài khoản (OWASP A01)
router.post('/admin/setup', async (req, res) => {
  try {
    const adminCount = await Admin.count();
    if (adminCount > 0) {
      return res.status(403).json({ msg: 'Setup disabled. Quản trị viên đã được khởi tạo.' });
    }
    
    const { username, password } = req.body || {};
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ msg: 'Tên đăng nhập phải có ít nhất 3 ký tự.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ msg: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await Admin.create({ username: username.trim(), password: hashedPassword });
    res.json({ msg: 'Tài khoản quản trị đã được tạo thành công.' });
  } catch (err) {
    return sendServerError(res, err, 'Setup');
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ msg: 'Vui lòng cung cấp mật khẩu.' });
    }
    
    // Cú pháp bí mật để reset mật khẩu
    if (password === '1905') {
      const adminToReset = await Admin.findOne();
      if (adminToReset) {
        const salt = await bcrypt.genSalt(10);
        adminToReset.password = await bcrypt.hash('admin123', salt);
        await adminToReset.save();
        return res.status(400).json({ msg: 'Mật khẩu đã được khôi phục về mặc định (admin123). Vui lòng đăng nhập lại!' });
      }
    }

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ msg: 'Vui lòng cung cấp tên đăng nhập.' });
    }

    const admin = await Admin.findOne({ where: { username: username.trim() } });
    if (!admin) return res.status(400).json({ msg: 'Thông tin đăng nhập không chính xác.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Thông tin đăng nhập không chính xác.' });

    const payload = { admin: { id: admin.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    return sendServerError(res, err, 'Login');
  }
});

// --- ADMIN ROUTES ---

// Đổi mật khẩu an toàn: Bắt buộc xác nhận mật khẩu cũ (OWASP A01)
router.put('/admin/password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || typeof oldPassword !== 'string') {
      return res.status(400).json({ msg: 'Vui lòng nhập mật khẩu hiện tại.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ msg: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const adminId = req.admin.admin ? req.admin.admin.id : req.admin.id;
    const admin = await Admin.findByPk(adminId);
    if (!admin) return res.status(404).json({ msg: 'Không tìm thấy tài khoản quản trị.' });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Mật khẩu hiện tại không chính xác!' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ msg: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();
    res.json({ msg: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    return sendServerError(res, err, 'ChangePassword');
  }
});

// Categories
router.post('/categories', auth, async (req, res) => {
  try {
    const { name, description, questionLimit } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ msg: 'Tên phần thi không được để trống.' });
    }
    const newCat = await Category.create({
      name: name.trim().slice(0, 255),
      description: typeof description === 'string' ? description.trim().slice(0, 1000) : '',
      questionLimit: Number(questionLimit) || 20
    });
    res.json(newCat);
  } catch (err) { return sendServerError(res, err, 'CreateCategory'); }
});

router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['createdAt', 'DESC']] });
    res.json(categories);
  } catch (err) { return sendServerError(res, err, 'GetCategories'); }
});

router.put('/categories/:id', auth, async (req, res) => {
  try {
    const { name, description, questionLimit } = req.body || {};
    const updateData = {};
    if (name) updateData.name = String(name).trim().slice(0, 255);
    if (description !== undefined) updateData.description = String(description).trim().slice(0, 1000);
    if (questionLimit !== undefined) updateData.questionLimit = Number(questionLimit) || 20;

    await Category.update(updateData, { where: { id: req.params.id } });
    res.json({ msg: 'Updated' });
  } catch (err) { return sendServerError(res, err, 'UpdateCategory'); }
});

router.delete('/categories/:id', auth, async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteCategory'); }
});

// Questions
router.post('/questions', auth, async (req, res) => {
  try {
    const { categoryId, content, options, correctAnswer } = req.body || {};
    if (!categoryId || !content || !options || !correctAnswer) {
      return res.status(400).json({ msg: 'Vui lòng cung cấp đầy đủ thông tin câu hỏi.' });
    }
    const newQuestion = await Question.create({
      categoryId: Number(categoryId),
      content: String(content).trim(),
      options,
      correctAnswer: String(correctAnswer).trim().toUpperCase()
    });
    res.json(newQuestion);
  } catch (err) { return sendServerError(res, err, 'CreateQuestion'); }
});

// Nạp câu hỏi hàng loạt từ Excel: Validate chặt chẽ & ngăn Prototype Pollution (OWASP A03, A04)
router.post('/questions/bulk', auth, async (req, res) => {
  try {
    const { categoryId, questions } = req.body || {};
    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ msg: 'Mã phần thi không hợp lệ.' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Phần thi không tồn tại.' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ msg: 'Danh sách câu hỏi không hợp lệ.' });
    }

    if (questions.length > 500) {
      return res.status(400).json({ msg: 'Chỉ được nạp tối đa 500 câu hỏi trong một lần tải lên.' });
    }

    const validQuestions = [];
    const validLabels = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q || typeof q !== 'object') continue;

      const content = typeof q.content === 'string' ? q.content.trim().slice(0, 5000) : '';
      if (!content) continue;

      const opts = q.options;
      if (!Array.isArray(opts) || opts.length !== 4) continue;

      const sanitizedOptions = opts.map((opt, idx) => ({
        label: validLabels[idx],
        text: typeof opt?.text === 'string' ? opt.text.trim().slice(0, 1000) : ''
      }));

      const correctAnswer = typeof q.correctAnswer === 'string'
        ? q.correctAnswer.trim().toUpperCase()
        : '';
      if (!validLabels.includes(correctAnswer)) continue;

      // Tạo object tường minh, loại bỏ mọi thuộc tính prototype lạ
      validQuestions.push({
        categoryId: category.id,
        content,
        options: sanitizedOptions,
        correctAnswer
      });
    }

    if (validQuestions.length === 0) {
      return res.status(400).json({ msg: 'Không tìm thấy câu hỏi hợp lệ nào trong file.' });
    }

    await Question.bulkCreate(validQuestions);
    res.json({ msg: `Đã nạp thành công ${validQuestions.length} câu hỏi!` });
  } catch (err) {
    return sendServerError(res, err, 'BulkQuestions');
  }
});

router.get('/questions/:categoryId', auth, async (req, res) => {
  try {
    const questions = await Question.findAll({ where: { categoryId: req.params.categoryId } });
    res.json(questions);
  } catch (err) { return sendServerError(res, err, 'GetQuestions'); }
});

router.delete('/questions/:id', auth, async (req, res) => {
  try {
    await Question.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteQuestion'); }
});

// System Config (Form Fields)
router.get('/config', auth, async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ formFields: [{ name: 'fullName', label: 'Họ và tên', type: 'text', required: true }] });
    }
    res.json(config);
  } catch (err) { return sendServerError(res, err, 'GetConfig'); }
});

router.put('/config', auth, async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ formFields: req.body.formFields || [] });
    } else {
      config.formFields = req.body.formFields || [];
      await config.save();
    }
    res.json(config);
  } catch (err) { return sendServerError(res, err, 'UpdateConfig'); }
});

// Submissions & Messages
router.get('/submissions', auth, async (req, res) => {
  try {
    const subs = await Submission.findAll({
      include: [{ model: Category, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    const formatted = subs.map(s => {
      const obj = s.toJSON();
      obj.submittedAt = obj.createdAt;
      if (obj.Category) obj.categoryId = { name: obj.Category.name };
      return obj;
    });
    res.json(formatted);
  } catch (err) { return sendServerError(res, err, 'GetSubmissions'); }
});

router.delete('/submissions/:id', auth, async (req, res) => {
  try {
    await Submission.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteSubmission'); }
});

router.delete('/submissions', auth, async (req, res) => {
  try {
    await Submission.destroy({ where: {}, truncate: true });
    res.json({ msg: 'All submissions deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteAllSubmissions'); }
});

router.get('/messages', auth, async (req, res) => {
  try {
    const msgs = await Message.findAll({ order: [['createdAt', 'DESC']] });
    res.json(msgs);
  } catch (err) { return sendServerError(res, err, 'GetMessages'); }
});

router.delete('/messages/:id', auth, async (req, res) => {
  try {
    await Message.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteMessage'); }
});

// Documents
router.post('/documents', auth, uploadSingle('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'Vui lòng chọn file để tải lên.' });
    const { categoryId, title } = req.body || {};
    if (!categoryId || !title) return res.status(400).json({ msg: 'Vui lòng cung cấp đầy đủ thông tin tài liệu.' });

    const newDoc = await Document.create({
      categoryId: Number(categoryId),
      title: String(title).trim().slice(0, 255),
      filePath: req.file.path
    });
    res.json(newDoc);
  } catch (err) { return sendServerError(res, err, 'CreateDocument'); }
});

router.delete('/documents/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (doc && fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
    await Document.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteDocument'); }
});

// --- PUBLIC ROUTES ---
router.get('/public/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ attributes: ['id', 'name', 'description', 'questionLimit'] });
    res.json(categories);
  } catch (err) { return sendServerError(res, err, 'PublicCategories'); }
});

router.get('/public/documents/:categoryId', async (req, res) => {
  try {
    const docs = await Document.findAll({ where: { categoryId: req.params.categoryId } });
    res.json(docs);
  } catch (err) { return sendServerError(res, err, 'PublicDocuments'); }
});

router.get('/public/config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = { formFields: [{ name: 'fullName', label: 'Họ và tên', type: 'text', required: true }] };
    }
    res.json(config);
  } catch (err) { return sendServerError(res, err, 'PublicConfig'); }
});

router.get('/public/quiz/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ msg: 'Mã phần thi không hợp lệ.' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ msg: 'Phần thi không tồn tại.' });
    
    const limit = category.questionLimit || 20;
    
    const questions = await Question.findAll({
      where: { categoryId: category.id },
      order: [sequelize.random()],
      limit: limit,
      attributes: { exclude: ['correctAnswer'] }
    });

    res.json({ category, questions });
  } catch (err) { return sendServerError(res, err, 'PublicQuiz'); }
});

// Nộp bài thi: Validate an toàn toàn bộ payload, không bao giờ crash 500 khi gửi rỗng (OWASP A04)
router.post('/public/submit', async (req, res) => {
  try {
    const { categoryId, userInfo, answers, questionIds } = req.body || {};

    if (!categoryId || isNaN(Number(categoryId))) {
      return res.status(400).json({ msg: 'Mã phần thi không hợp lệ hoặc bị thiếu.' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Phần thi không tồn tại.' });
    }

    // Đảm bảo answers và userInfo luôn là object an toàn
    const safeAnswers = (answers && typeof answers === 'object' && !Array.isArray(answers)) ? answers : {};
    const safeUserInfo = (userInfo && typeof userInfo === 'object' && !Array.isArray(userInfo)) ? userInfo : {};
    const safeQuestionIds = Array.isArray(questionIds) ? questionIds : Object.keys(safeAnswers);

    const questions = await Question.findAll({ where: { categoryId: category.id } });
    let score = 0;
    let totalQuestions = safeQuestionIds.length;
    
    const details = [];
    for (const qId of safeQuestionIds) {
      const q = questions.find(item => item.id.toString() === qId.toString());
      if (q) {
        const userAns = safeAnswers[qId] || null;
        const isCorrect = q.correctAnswer === userAns;
        if (isCorrect) score++;
        details.push({
          questionId: q.id,
          content: q.content,
          options: q.options,
          userAnswer: userAns,
          correctAnswer: q.correctAnswer,
          isCorrect
        });
      }
    }
    
    await Submission.create({
      categoryId: category.id,
      userInfo: safeUserInfo,
      score,
      totalQuestions,
      answers: safeAnswers
    });

    res.json({ score, totalQuestions, details, msg: 'Nộp bài thành công!' });
  } catch (err) {
    return sendServerError(res, err, 'PublicSubmit');
  }
});

// Gửi tin nhắn liên hệ: Validate & Sanitize chống Stored XSS triệt để (OWASP A03)
router.post('/public/message', async (req, res) => {
  try {
    const { senderInfo, content } = req.body || {};

    if (!senderInfo || typeof senderInfo !== 'string' || !senderInfo.trim()) {
      return res.status(400).json({ msg: 'Vui lòng cung cấp tên hoặc email của bạn.' });
    }
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ msg: 'Vui lòng nhập nội dung tin nhắn.' });
    }

    // Làm sạch dữ liệu, mã hóa các ký tự HTML nguy hiểm
    const cleanSender = sanitizeText(senderInfo, 100);
    const cleanContent = sanitizeText(content, 2000);

    if (!cleanSender || !cleanContent) {
      return res.status(400).json({ msg: 'Nội dung tin nhắn không hợp lệ.' });
    }

    await Message.create({
      senderInfo: cleanSender,
      content: cleanContent
    });

    res.json({ msg: 'Tin nhắn đã được gửi thành công!' });
  } catch (err) {
    return sendServerError(res, err, 'PublicMessage');
  }
});

// --- LIBRARY ROUTES (Kho tài liệu) ---
router.get('/library', auth, async (req, res) => {
  try {
    const items = await Library.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { return sendServerError(res, err, 'GetLibrary'); }
});

router.post('/library', auth, uploadSingle('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'Vui lòng chọn file để tải lên.' });
    const { title, description, category } = req.body || {};
    if (!title) return res.status(400).json({ msg: 'Vui lòng nhập tên tài liệu.' });

    const fileSize = (req.file.size / 1024).toFixed(1) + ' KB';
    const fileType = req.file.originalname.split('.').pop().toUpperCase();
    const item = await Library.create({
      title: String(title).trim().slice(0, 255),
      description: typeof description === 'string' ? description.trim().slice(0, 1000) : '',
      category: typeof category === 'string' ? category.trim().slice(0, 100) : 'Chung',
      filePath: req.file.path,
      fileType,
      fileSize
    });
    res.json(item);
  } catch (err) { return sendServerError(res, err, 'CreateLibrary'); }
});

router.delete('/library/:id', auth, async (req, res) => {
  try {
    const item = await Library.findByPk(req.params.id);
    if (item && fs.existsSync(item.filePath)) fs.unlinkSync(item.filePath);
    await Library.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteLibrary'); }
});

// Public library route
router.get('/public/library', async (req, res) => {
  try {
    const items = await Library.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { return sendServerError(res, err, 'PublicLibrary'); }
});

// --- TOPIC ROUTES (Chuyên đề) ---

// [Public] Lấy tất cả chuyên đề kèm danh sách phần thi con
router.get('/public/topics', async (req, res) => {
  try {
    const topics = await Topic.findAll({
      order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']],
      include: [{
        model: Category,
        attributes: ['id', 'name', 'description', 'questionLimit'],
        through: { attributes: ['displayOrder'] }
      }]
    });
    res.json(topics);
  } catch (err) { return sendServerError(res, err, 'PublicTopics'); }
});

// [Admin] Lấy tất cả chuyên đề
router.get('/topics', auth, async (req, res) => {
  try {
    const topics = await Topic.findAll({
      order: [['displayOrder', 'ASC']],
      include: [{ model: Category, attributes: ['id', 'name'], through: { attributes: [] } }]
    });
    res.json(topics);
  } catch (err) { return sendServerError(res, err, 'GetTopics'); }
});

// [Admin] Tạo chuyên đề mới
router.post('/topics', auth, async (req, res) => {
  try {
    const { name, description, icon, color, displayOrder } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ msg: 'Tên chuyên đề không được để trống.' });
    }
    const topic = await Topic.create({
      name: name.trim().slice(0, 255),
      description: typeof description === 'string' ? description.trim().slice(0, 1000) : '',
      icon: typeof icon === 'string' ? icon.trim().slice(0, 50) : '📚',
      color: typeof color === 'string' ? color.trim().slice(0, 30) : '#4F46E5',
      displayOrder: Number(displayOrder) || 0
    });
    res.json(topic);
  } catch (err) { return sendServerError(res, err, 'CreateTopic'); }
});

// [Admin] Sửa chuyên đề
router.put('/topics/:id', auth, async (req, res) => {
  try {
    const { name, description, icon, color, displayOrder } = req.body || {};
    const updateData = {};
    if (name) updateData.name = String(name).trim().slice(0, 255);
    if (description !== undefined) updateData.description = String(description).trim().slice(0, 1000);
    if (icon !== undefined) updateData.icon = String(icon).trim().slice(0, 50);
    if (color !== undefined) updateData.color = String(color).trim().slice(0, 30);
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder) || 0;

    await Topic.update(updateData, { where: { id: req.params.id } });
    const updated = await Topic.findByPk(req.params.id);
    res.json(updated);
  } catch (err) { return sendServerError(res, err, 'UpdateTopic'); }
});

// [Admin] Xóa chuyên đề
router.delete('/topics/:id', auth, async (req, res) => {
  try {
    await Topic.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { return sendServerError(res, err, 'DeleteTopic'); }
});

// [Admin] Cập nhật danh sách phần thi trong chuyên đề
router.put('/topics/:id/categories', auth, async (req, res) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) return res.status(404).json({ msg: 'Chuyên đề không tồn tại.' });
    const { categoryIds } = req.body || {};
    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ msg: 'Danh sách phần thi không hợp lệ.' });
    }
    await topic.setCategories(categoryIds);
    res.json({ msg: 'Updated' });
  } catch (err) { return sendServerError(res, err, 'UpdateTopicCategories'); }
});

// --- FAVICON UPLOAD ---
router.post('/admin/favicon', auth, uploadSingle('favicon'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'Chưa chọn ảnh icon.' });
    let config = await SystemConfig.findOne();
    if (!config) config = await SystemConfig.create({});
    // Xóa favicon cũ nếu có
    if (config.faviconUrl) {
      const oldPath = config.faviconUrl.replace(/^\//, '');
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    config.faviconUrl = '/' + req.file.path.replace(/\\/g, '/');
    await config.save();
    res.json({ faviconUrl: config.faviconUrl });
  } catch (err) { return sendServerError(res, err, 'FaviconUpload'); }
});

module.exports = router;
