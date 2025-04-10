import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import chatbotRouter from './chatbot/index.js';
config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/chatbot', chatbotRouter);

app.listen(port, () => {
  console.log(`✅ Gemini server running on http://localhost:${port}`);
});
