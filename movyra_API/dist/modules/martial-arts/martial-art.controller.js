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
exports.listProgress = listProgress;
exports.updateProgress = updateProgress;
exports.promoteAthlete = promoteAthlete;
const zod_1 = require("zod");
const martialArtService = __importStar(require("./martial-art.service"));
const progressSchema = zod_1.z.object({
    martialArt: zod_1.z.string().min(1, 'Arte Marcial é obrigatória'),
    currentBelt: zod_1.z.string().min(1, 'Faixa atual é obrigatória'),
    degree: zod_1.z.number().min(0).max(4),
    notes: zod_1.z.string().optional().nullable(),
});
const promoteSchema = zod_1.z.object({
    martialArt: zod_1.z.string().min(1, 'Arte Marcial é obrigatória'),
    currentBelt: zod_1.z.string().min(1, 'Faixa atual é obrigatória'),
    degree: zod_1.z.number().min(0).max(4),
    notes: zod_1.z.string().optional().nullable(),
});
async function listProgress(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const progressList = await martialArtService.listProgress(tenantId);
        return res.json(progressList);
    }
    catch (error) {
        next(error);
    }
}
async function updateProgress(req, res, next) {
    try {
        const { studentId } = req.params;
        const tenantId = req.user.tenantId;
        const data = progressSchema.parse(req.body);
        const progress = await martialArtService.updateProgress(tenantId, studentId, data);
        return res.json(progress);
    }
    catch (error) {
        next(error);
    }
}
async function promoteAthlete(req, res, next) {
    try {
        const { studentId } = req.params;
        const tenantId = req.user.tenantId;
        const data = promoteSchema.parse(req.body);
        const progress = await martialArtService.promoteAthlete(tenantId, studentId, data);
        return res.json({
            message: 'Graduação realizada com sucesso!',
            progress
        });
    }
    catch (error) {
        next(error);
    }
}
