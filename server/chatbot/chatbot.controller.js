import { getEmbedding } from '../utils.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { index } from '../pinecone/pinecone.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askChatbot = async (req, res) => {
    const { question, recentHistory } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const queryEmbedding = await getEmbedding(question);
        if (!queryEmbedding) {
            return res.json({ answer: 'Please repeat!' });
        }

        const pineconeResult = await index.query({
            topK: 25,
            vector: queryEmbedding,
            includeMetadata: true,
        });

        const references = pineconeResult?.matches.reduce((acc, match) => {
            acc += JSON.stringify(match.metadata) + '\n';
            return acc;
        }, "")

        const prompt = [
            'You are now Restroworks POS systems AI chatbot. User has asked a question about the system, present at the end of this prompt and below are some info about the system. Answer their query in a friendly and helpful manner. Answer should be in max 3-4 sentences and it should be based only on the info provided below:',
            references,
            'Below is the conversation history with the user:',
            JSON.stringify(recentHistory),
            `User question: ${question}`,
            'Consider the history only if the question is related to the previous conversation. If the question is not related to the previous conversation, ignore the history and answer based on the info provided above.',
            'If you feel the user question is just a general message and not a query, answer accordingly, it may or may not contain anything related to POS.',
        ].join('\n\n');

        console.log('Prompt:', prompt);

        const result = await model.generateContent(prompt);

        const text = result.response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error('Gemini Error:', error);
        res.status(500).json({ error: 'Something went wrong with Gemini.' });
    }
}

export { askChatbot };