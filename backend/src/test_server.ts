import express from 'express';

const app = express();
const PORT = 3003;

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
