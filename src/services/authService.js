"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
const env_1 = require("../config/env");
const registerAdmin = async (email, password, role = "STAFF") => {
    const existing = await Admin_1.default.findOne({ email });
    if (existing)
        throw new Error("Admin already exists");
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const admin = new Admin_1.default({ email, password: hashed, role });
    return admin.save();
};
exports.registerAdmin = registerAdmin;
const loginAdmin = async (email, password) => {
    const admin = await Admin_1.default.findOne({ email });
    if (!admin)
        throw new Error("Invalid credentials");
    const valid = await bcryptjs_1.default.compare(password, admin.password);
    if (!valid)
        throw new Error("Invalid credentials");
    const secret = env_1.config.jwtSecret;
    const options = { expiresIn: env_1.config.jwtExpiry };
    const token = jsonwebtoken_1.default.sign({ id: admin._id, role: admin.role }, secret, options);
    return { token, admin };
};
exports.loginAdmin = loginAdmin;
