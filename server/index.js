import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(question);

    const text = result.response.text();

    res.json({ answer: text });
  } catch (error) {
    console.error('Gemini Error:', error.message);
    res.status(500).json({ error: 'Something went wrong with Gemini.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Gemini server running on http://localhost:${port}`);
});
