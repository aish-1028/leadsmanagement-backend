"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.createUser = exports.login = exports.signup = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const signToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, error: "Name, email and password are required" });
            return;
        }
        const existing = await User_1.default.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            res.status(400).json({ success: false, error: "A user with this email already exists" });
            return;
        }
        const user = new User_1.default({ name: name.trim(), email: email.toLowerCase().trim(), password, role });
        const saved = await user.save();
        const token = signToken(saved._id.toString());
        res.status(201).json({ success: true, data: { user: saved, token }, message: "User created" });
    }
    catch (error) {
        console.error("Signup error:", error);
        if (error.name === "ValidationError" || error.code === 11000) {
            res.status(400).json({ success: false, error: error.message || "Invalid input" });
        }
        else {
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, error: "Email and password are required" });
            return;
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            res.status(401).json({ success: false, error: "Invalid credentials" });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, error: "Invalid credentials" });
            return;
        }
        const token = signToken(user._id.toString());
        res.status(200).json({ success: true, data: { user, token } });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
exports.login = login;
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, error: "Name, email and password are required" });
            return;
        }
        const existing = await User_1.default.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            res.status(400).json({ success: false, error: "A user with this email already exists" });
            return;
        }
        const user = new User_1.default({ name: name.trim(), email: email.toLowerCase().trim(), password, role });
        const saved = await user.save();
        res.status(201).json({ success: true, data: saved, message: "User created" });
    }
    catch (error) {
        console.error("Create user error:", error);
        if (error.name === "ValidationError" || error.code === 11000) {
            res.status(400).json({ success: false, error: error.message || "Invalid input" });
        }
        else {
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password');
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error("Update user error:", error);
        if (error.name === "ValidationError" || error.code === 11000) {
            res.status(400).json({ success: false, error: error.message || "Invalid input" });
        }
        else {
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.status(200).json({ success: true, message: "User deleted" });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map