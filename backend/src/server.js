import express from 'express';
import cors from 'cors';
import accoutRoutes from './routes/accountRoutes.js';
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
app.use('/api/accounts', accoutRoutes);

// === Server Listening ===
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})