"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_js_1 = require("./middleware/auth.js");
const auth_js_2 = __importDefault(require("./routes/auth.js"));
const spaces_js_1 = __importDefault(require("./routes/spaces.js"));
const tenants_js_1 = __importDefault(require("./routes/tenants.js"));
const contracts_js_1 = __importDefault(require("./routes/contracts.js"));
const payments_js_1 = __importDefault(require("./routes/payments.js"));
const stats_js_1 = __importDefault(require("./routes/stats.js"));
const upload_js_1 = __importDefault(require("./routes/upload.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('CORS Origin configured as:', origin);
// Middleware
app.use((0, cors_1.default)({
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Health check
app.get('/api/health', (req, res) => {
    console.log('Health check hit!');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Public routes
app.use('/api/auth', auth_js_2.default);
// Protected routes (require authentication)
app.use('/api/spaces', auth_js_1.authMiddleware, spaces_js_1.default);
app.use('/api/tenants', auth_js_1.authMiddleware, tenants_js_1.default);
app.use('/api/contracts', auth_js_1.authMiddleware, contracts_js_1.default);
app.use('/api/payments', auth_js_1.authMiddleware, payments_js_1.default);
app.use('/api/stats', auth_js_1.authMiddleware, stats_js_1.default);
app.use('/api/upload', auth_js_1.authMiddleware, upload_js_1.default);
// Error handling
app.use((err, req, res, next) => {
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
