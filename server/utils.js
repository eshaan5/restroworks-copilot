import { config } from 'dotenv';
import { CohereClient } from 'cohere-ai';
config();

const cohere = new CohereClient({ token: process.env.COHERE_TOKEN });

config();
const HF_API_TOKEN = process.env.HF_API_KEY;

async function getEmbedding(text) {
    try {
        // console.log('text', text);
        // const response = await axios.post(
        //     'https://api-inference.huggingface.co/pipeline/feature-extraction/intfloat/e5-large',
        //     {
        //         inputs: text,
        //     },
        //     {
        //         headers: {
        //             Authorization: `Bearer ${HF_API_TOKEN}`,
        //             'Content-Type': 'application/json',
        //         },
        //     }
        // );

        // return response.data; // this is a vector (array of floats)
        const embed = await cohere.v2.embed({
            texts: [text],
            model: 'embed-english-v3.0',
            inputType: 'classification',
            embeddingTypes: ['float'],
        });
      
        const embedding = embed.embeddings.float[0];
        console.log('embedding', embedding);
        return embedding;
    } catch (err) {
        console.log('Error embedding:', err);
        console.error('Embedding error:', err.response?.data || err.message);
        return null;
    }
}

export { getEmbedding };