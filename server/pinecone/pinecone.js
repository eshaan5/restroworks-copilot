import { Pinecone } from '@pinecone-database/pinecone';
import { config } from 'dotenv';
config();

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.Index('table-2');

const uploadToPinecone = async (data, embedding, key) => {
    await index.upsert([
        {
            id: key,
            values: embedding,
            metadata: {
                ...data
            },
        },
    ]);
}

export { uploadToPinecone, index };