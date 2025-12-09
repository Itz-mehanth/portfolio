import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Schema
const ScoreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

// Routes

// Get High Score
app.get('/api/highscore', async (req, res) => {
    try {
        const highScore = await Score.findOne().sort({ score: -1 });
        res.json(highScore || { score: 0, name: 'None' });
    } catch (err) {
        console.error("Error fetching high score:", err);
        res.status(500).json({ error: err.message });
    }
});

// Submit Score
app.post('/api/score', async (req, res) => {
    const { name, score } = req.body;
    try {
        const newScore = new Score({ name, score });
        await newScore.save();
        res.status(201).json(newScore);
    } catch (err) {
        console.error("Error submitting score:", err);
        res.status(400).json({ error: err.message });
    }
});

const isVercel = process.env.VERCEL === '1';

if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
