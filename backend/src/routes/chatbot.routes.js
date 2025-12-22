import express from 'express';
import axios from 'axios';

const router = express.Router();
const FASTAPI_URL = 'http://127.0.0.1:8000';

router.post('/chat', async (req, res) => {
    try {
        const response = await axios.post(`${FASTAPI_URL}/api/chat`, {
            query: req.body.query
        });
        res.json(response.data);
    } catch (error) {
        console.error('Chatbot Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error processing chat request'
        });
    }
});

router.post('/booking', async (req, res) => {
    try {
        const response = await axios.post(`${FASTAPI_URL}/api/booking`, {
            query: req.body.query,
            patient_name: req.body.patient_name,
            patient_phone: req.body.patient_phone,
            patient_email: req.body.patient_email
        });
        res.json(response.data);
    } catch (error) {
        console.error('Booking Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error processing booking request'
        });
    }
});

export default router;