import xlsx from 'xlsx';
import fs from 'fs';
import { getEmbedding } from '../utils.js';
import { v4 as uuidv4 } from 'uuid';
import { uploadToPinecone } from '../pinecone/pinecone.js';
import async from 'async';


const uploadDocument = async (req, res)=>{
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
    
        const filePath = file.path;
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
    
        fs.unlinkSync(filePath);

        const uploadFuncs = data.map((row) => {
            return function (cb) {
              (async () => {
                try {
                  const key = uuidv4();
                  const embeddings = await getEmbedding(JSON.stringify(row));
                  await uploadToPinecone(row, embeddings, key);
                  cb();
                } catch (err) {
                  cb(err);
                }
              })();
            };
          });
        async.parallelLimit(uploadFuncs,5,(err, result)=>{
            if(err){
                console.error('Upload error:', err);
                return res.status(500).json({ error: 'Failed to process file' });
            }
            return res.status(200).json({ message: 'File processed', data });
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Failed to process file' });
    }
}

export {uploadDocument};