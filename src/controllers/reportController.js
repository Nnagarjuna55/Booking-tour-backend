"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePlacesCount = exports.getSlotUtilization = exports.getTopPlaces = exports.getSummary = void 0;
const reportService = __importStar(require("../services/reportService"));
const getSummary = async (req, res) => {
    const { from, to } = req.query;
    const summary = await reportService.getSummaryReport(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    res.json(summary);
};
exports.getSummary = getSummary;
const getTopPlaces = async (req, res) => {
    const { limit } = req.query;
    const topPlaces = await reportService.getTopPlaces(limit ? parseInt(limit) : 5);
    res.json(topPlaces);
};
exports.getTopPlaces = getTopPlaces;
const getSlotUtilization = async (req, res) => {
    const { placeId } = req.params;
    const data = await reportService.getSlotUtilization(placeId);
    res.json(data);
};
exports.getSlotUtilization = getSlotUtilization;
const getActivePlacesCount = async (_req, res) => {
    const count = await reportService.getActivePlacesCount();
    res.json({ count });
};
exports.getActivePlacesCount = getActivePlacesCount;
