import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import accoutRoutes from './routes/accountRoutes.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Connect to Database ===
connectDB();

// === Middleware ===
// CORS Settings - must be before middleware that handles requests
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server address
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser()); // Parse cookies

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accoutRoutes);
app.use('/api/transactions', transactionRoutes);

// === Server Listening ===
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
})