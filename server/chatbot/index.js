import { Router } from 'express';
import { askChatbot } from './chatbot.controller.js';

const router = Router();

router.post('/ask', askChatbot);

export default router;
