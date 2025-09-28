"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (msg) => console.log(`ℹ️ ${msg}`),
    error: (msg, err) => console.error(`❌ ${msg}`, err || ""),
    warn: (msg) => console.warn(`⚠️ ${msg}`),
};
