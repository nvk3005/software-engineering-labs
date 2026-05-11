import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'minlish',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

export const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully.');
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
  }
};

export default sequelize;
