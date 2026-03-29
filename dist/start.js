"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = __importDefault(require("./db/connection"));
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 5000;
app.set("trust proxy", 1);
// Connect to MongoDB
(0, connection_1.default)();
// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    // Add other allowed origins as needed
];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If you need to send cookies or auth headers
    maxAge: 86400, // Cache preflight requests for 24 hours
};
// Apply CORS middleware
app.use((0, cors_1.default)(corsOptions));
// Handle preflight OPTIONS requests
app.options("*", (0, cors_1.default)(corsOptions));
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", ...allowedOrigins],
        },
    },
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
        success: false,
        error: "Too many requests from this IP, please try again later",
    },
});
app.use(limiter);
// Debug middleware to log request and response headers
app.use((req, res, next) => {
    console.log("Request Origin:", req.headers.origin);
    console.log("Response Headers:", res.getHeaders());
    next();
});
// Body parsing middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use("/api/leads", leadRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
// Error handling middleware
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
exports.default = app;
//# sourceMappingURL=start.js.map