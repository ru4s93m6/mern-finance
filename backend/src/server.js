import express from 'express';
import accoutRoutes from './routes/accountRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Connect to Database ===
connectDB();

// === Middleware ===
app.use(express.json());
app.use('/api/accounts', accoutRoutes);

// === Server Listening ===
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})