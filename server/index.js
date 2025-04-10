require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if enabled
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for a POS application. Use the product reference guide knowledge.',
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.3,
    });

    const answer = chatCompletion.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.status(500).json({ error: 'Something went wrong with OpenAI.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
