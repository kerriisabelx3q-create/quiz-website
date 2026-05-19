const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { sequelize, Admin, Category, Question, SystemConfig, Submission, Message, Document, Library } = require('../models');
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

// Chỉ cho phép upload các loại file tài liệu an toàn
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được phép. Chỉ chấp nhận PDF, Word, Excel, PowerPoint, TXT.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }); // Giới hạn 20MB


// --- AUTH & SETUP ---
router.post('/admin/setup', async (req, res) => {
  try {
    const adminCount = await Admin.count();
    if (adminCount > 0) return res.status(400).json({ msg: 'Admin already exists' });
    
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'admin123', salt);
    
    await Admin.create({ username: username || 'admin', password: hashedPassword });
    res.json({ msg: 'Admin created successfully' });
  } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { admin: { id: admin.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- ADMIN ROUTES ---
// Categories
router.post('/categories', auth, async (req, res) => {
  try {
    const newCat = await Category.create(req.body);
    res.json(newCat);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['createdAt', 'DESC']] });
    res.json(categories);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.put('/categories/:id', auth, async (req, res) => {
  try {
    await Category.update(req.body, { where: { id: req.params.id } });
    res.json({ msg: 'Updated' });
  } catch (err) { res.status(500).send('Server Error'); }
});
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    // Note: CASCADE is set up in associations, so questions will be deleted automatically
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Questions
router.post('/questions', auth, async (req, res) => {
  try {
    const newQuestion = await Question.create(req.body);
    res.json(newQuestion);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.post('/questions/bulk', auth, async (req, res) => {
  try {
    const { categoryId, questions } = req.body;
    const bulkData = questions.map(q => ({ ...q, categoryId }));
    await Question.bulkCreate(bulkData);
    res.json({ msg: 'Bulk inserted successfully' });
  } catch (err) { res.status(500).send('Server Error'); }
});
router.get('/questions/:categoryId', auth, async (req, res) => {
  try {
    const questions = await Question.findAll({ where: { categoryId: req.params.categoryId } });
    res.json(questions);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.delete('/questions/:id', auth, async (req, res) => {
  try {
    await Question.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// System Config (Form Fields)
router.get('/config', auth, async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ formFields: [{ name: 'fullName', label: 'Họ và tên', type: 'text', required: true }] });
    }
    res.json(config);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.put('/config', auth, async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ formFields: req.body.formFields });
    } else {
      config.formFields = req.body.formFields;
      await config.save();
    }
    res.json(config);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Submissions & Messages
router.get('/submissions', auth, async (req, res) => {
  try {
    const subs = await Submission.findAll({
      include: [{ model: Category, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    // Transform to match previous payload
    const formatted = subs.map(s => {
       const obj = s.toJSON();
       obj.submittedAt = obj.createdAt;
       if (obj.Category) obj.categoryId = { name: obj.Category.name };
       return obj;
    });
    res.json(formatted);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.get('/messages', auth, async (req, res) => {
  try {
    const msgs = await Message.findAll({ order: [['createdAt', 'DESC']] });
    res.json(msgs);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    await Message.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Documents
router.post('/documents', auth, upload.single('file'), async (req, res) => {
  try {
    const { categoryId, title } = req.body;
    const newDoc = await Document.create({ categoryId, title, filePath: req.file.path });
    res.json(newDoc);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.delete('/documents/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if(doc && fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
    await Document.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- PUBLIC ROUTES ---
router.get('/public/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ attributes: ['id', 'name', 'description', 'questionLimit'] });
    res.json(categories);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.get('/public/documents/:categoryId', async (req, res) => {
  try {
    const docs = await Document.findAll({ where: { categoryId: req.params.categoryId } });
    res.json(docs);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.get('/public/config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = { formFields: [{ name: 'fullName', label: 'Họ và tên', type: 'text', required: true }] };
    }
    res.json(config);
  } catch (err) { res.status(500).send('Server Error'); }
});
router.get('/public/quiz/:categoryId', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.categoryId);
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    
    const limit = category.questionLimit || 20;
    
    const questions = await Question.findAll({
      where: { categoryId: category.id },
      order: [sequelize.random()],
      limit: limit,
      attributes: { exclude: ['correctAnswer'] } // Hide correct answer
    });

    res.json({ category, questions });
  } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/public/submit', async (req, res) => {
  try {
    const { categoryId, userInfo, answers } = req.body;
    // Calculate score
    const questions = await Question.findAll({ where: { categoryId } });
    let score = 0;
    let totalQuestions = Object.keys(answers).length;
    
    const details = [];
    for (const [qId, ans] of Object.entries(answers)) {
      const q = questions.find(q => q.id.toString() === qId.toString());
      if (q) {
        const isCorrect = q.correctAnswer === ans;
        if (isCorrect) {
          score++;
        }
        details.push({
          questionId: q.id,
          content: q.content,
          options: q.options,
          userAnswer: ans,
          correctAnswer: q.correctAnswer,
          isCorrect
        });
      }
    }
    
    const submission = await Submission.create({
      categoryId,
      userInfo,
      score,
      totalQuestions,
      answers
    });
    res.json({ score, totalQuestions, details, msg: 'Submitted successfully' });
  } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.post('/public/message', async (req, res) => {
  try {
    await Message.create(req.body);
    res.json({ msg: 'Message sent' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- LIBRARY ROUTES (Kho tài liệu) ---
router.get('/library', auth, async (req, res) => {
  try {
    const items = await Library.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/library', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const fileSize = (req.file.size / 1024).toFixed(1) + ' KB';
    const fileType = req.file.originalname.split('.').pop().toUpperCase();
    const item = await Library.create({
      title, description, category,
      filePath: req.file.path,
      fileType, fileSize
    });
    res.json(item);
  } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

router.delete('/library/:id', auth, async (req, res) => {
  try {
    const item = await Library.findByPk(req.params.id);
    if (item && fs.existsSync(item.filePath)) fs.unlinkSync(item.filePath);
    await Library.destroy({ where: { id: req.params.id } });
    res.json({ msg: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// Public library route
router.get('/public/library', async (req, res) => {
  try {
    const items = await Library.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;
