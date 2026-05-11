import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { sequelize } from './src/models/mysql/index.js';
import { connectMongoDB } from './src/config/mongodb.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully.');
    // Sử dụng alter: true để Sequelize tự động kiểm tra và cập nhật cột cho khớp
    await sequelize.sync({ alter: true });
    console.log('MySQL models synchronized.');
  } catch (error) {
    console.error('Unable to connect to MySQL or sync models:', error);
  }

  await connectMongoDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
