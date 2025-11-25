import express from 'express';  
dotenv.config();
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import cors from 'cors';

dotenv.config();
const port = process.env.PORT || 4000;
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);





app.listen(port, () => {
connectDB();
  console.log(`Server is running on port ${port}`);
});

app.use(express.json());