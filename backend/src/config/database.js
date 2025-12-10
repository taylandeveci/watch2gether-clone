import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// FIXED: Enable SSL for Supabase (or any cloud DB) regardless of NODE_ENV
// Supabase requires SSL even in development mode
const isSupabase = process.env.DATABASE_URL?.includes('supabase.co');
const requireSSL = process.env.NODE_ENV === 'production' || isSupabase;

// Create Sequelize instance using DATABASE_URL as single source of truth
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: requireSSL ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
});

// Test database connection
export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    } else {
      await sequelize.sync();
      console.log('✅ Database models loaded');
    }
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

export default sequelize;
