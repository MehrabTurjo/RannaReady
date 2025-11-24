import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT || 4000;
const app = express();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(cors());
app.use(express.json());