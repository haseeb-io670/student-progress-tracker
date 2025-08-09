import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ 
  path: path.resolve(__dirname, '../.env')
});

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

// Export configuration
export default {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION_DAYS,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  mongoose: {
    url: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};

