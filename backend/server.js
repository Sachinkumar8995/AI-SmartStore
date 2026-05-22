import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aiMode: process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'demo'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 SmartStore AI Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🤖 AI Mode: ${process.env.GEMINI_API_KEY ? 'Live (Gemini)' : process.env.OPENAI_API_KEY ? 'Live (OpenAI)' : 'Demo (Mock Responses)'}\n`);
});


export default app;
