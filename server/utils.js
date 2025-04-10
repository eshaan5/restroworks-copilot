import axios from 'axios';
import { config } from 'dotenv';
config();

const HF_API_TOKEN = process.env.HF_API_KEY;

async function getEmbedding(text) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/pipeline/feature-extraction/intfloat/e5-large',
            {
                inputs: text,
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data; // this is a vector (array of floats)
    } catch (err) {
        console.error('Embedding error:', err.response?.data || err.message);
        return null;
    }
}

export { getEmbedding };