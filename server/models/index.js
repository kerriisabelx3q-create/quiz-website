const { Sequelize, DataTypes } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: false
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false
    });

const Admin = sequelize.define('Admin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  questionLimit: { type: DataTypes.INTEGER, defaultValue: 20 }
});

const Question = sequelize.define('Question', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.JSON, allowNull: false }, // SQLite supports JSON text, Sequelize parses it
  correctAnswer: { type: DataTypes.STRING, allowNull: false }
});

Category.hasMany(Question, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Question.belongsTo(Category, { foreignKey: 'categoryId' });

const SystemConfig = sequelize.define('SystemConfig', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  formFields: { type: DataTypes.JSON, defaultValue: [] },
  faviconUrl: { type: DataTypes.STRING, defaultValue: '' }
});

// Chuyên đề lớn — gộp nhiều phần thi
const Topic = sequelize.define('Topic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  icon: { type: DataTypes.STRING, defaultValue: '📚' },
  color: { type: DataTypes.STRING, defaultValue: '#4F46E5' },
  displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Bảng trung gian: Chuyên đề ↔ Phần thi (nhiều-nhiều)
const TopicCategory = sequelize.define('TopicCategory', {
  topicId: { type: DataTypes.INTEGER, allowNull: false },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: false });

Topic.belongsToMany(Category, { through: TopicCategory, foreignKey: 'topicId', otherKey: 'categoryId' });
Category.belongsToMany(Topic, { through: TopicCategory, foreignKey: 'categoryId', otherKey: 'topicId' });

const Submission = sequelize.define('Submission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userInfo: { type: DataTypes.JSON },
  score: { type: DataTypes.INTEGER, allowNull: false },
  totalQuestions: { type: DataTypes.INTEGER, allowNull: false },
  answers: { type: DataTypes.JSON }
});

Category.hasMany(Submission, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Submission.belongsTo(Category, { foreignKey: 'categoryId' });

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  senderInfo: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false }
});

Category.hasMany(Document, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Document.belongsTo(Category, { foreignKey: 'categoryId' });

// Kho tài liệu độc lập (không gắn với phần thi)
const Library = sequelize.define('Library', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  filePath: { type: DataTypes.STRING, allowNull: false },
  fileType: { type: DataTypes.STRING, defaultValue: '' },
  fileSize: { type: DataTypes.STRING, defaultValue: '' },
  category: { type: DataTypes.STRING, defaultValue: 'Chung' }
});

module.exports = {
  sequelize,
  Admin,
  Category,
  Question,
  SystemConfig,
  Submission,
  Message,
  Document,
  Library,
  Topic,
  TopicCategory
};
