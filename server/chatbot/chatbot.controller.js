import { getEmbedding } from '../utils.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { index } from '../pinecone/pinecone.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askChatbot = async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const queryEmbedding = await getEmbedding(question);

        const result = await index.query({
            topK: 5,
            vector: queryEmbedding,
            includeMetadata: true,
        });
        console.log(JSON.stringify(result.matches, null, 2));

        // const result1 = await model.generateContent(question);

        // const text = result.response.text();

        res.json({ answer: result });
    } catch (error) {
        console.error('Gemini Error:', error.message);
        res.status(500).json({ error: 'Something went wrong with Gemini.' });
    }
}

export { askChatbot };