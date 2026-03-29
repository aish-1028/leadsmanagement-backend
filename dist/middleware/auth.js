"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ success: false, error: "Not authorized, token missing" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            res.status(401).json({ success: false, error: "Not authorized, invalid token" });
            return;
        }
        const user = await User_1.default.findById(decoded.id).select("-password");
        if (!user) {
            res.status(401).json({ success: false, error: "Not authorized, user not found" });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ success: false, error: "Not authorized" });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: "Not authorized" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, error: "Forbidden: insufficient permissions" });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map