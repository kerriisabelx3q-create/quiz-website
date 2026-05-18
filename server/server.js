require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Sync Sequelize (Creates database.sqlite file automatically)
sequelize.sync({ alter: true })
  .then(() => console.log('SQLite Database Connected & Synced!'))
  .catch(err => console.error('Failed to sync SQLite DB', err));

// Import Routes
app.use('/api', require('./routes/api'));

// Phục vụ giao diện Frontend (React)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
