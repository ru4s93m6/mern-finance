import express from 'express';
import accoutRoutes from './routes/accountRoutes.js';

const app = express();

app.use('/api/notes', accoutRoutes);


// === Server Listening ===
app.listen(3000, () => {
    console.log("Server is running on port 5001");
})