import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import spacesRoutes from './routes/spaces.js';
import tenantsRoutes from './routes/tenants.js';
import contractsRoutes from './routes/contracts.js';
import paymentsRoutes from './routes/payments.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('CORS Origin configured as:', origin);

// Middleware
app.use(cors({
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    console.log('Health check hit!');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/spaces', authMiddleware, spacesRoutes);
app.use('/api/tenants', authMiddleware, tenantsRoutes);
app.use('/api/contracts', authMiddleware, contractsRoutes);
app.use('/api/payments', authMiddleware, paymentsRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
