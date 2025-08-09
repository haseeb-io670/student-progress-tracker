import dotenv from 'dotenv';
dotenv.config();

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  throw new Error('LORA LYLO BC');
}

export default {
  mongoURI
};