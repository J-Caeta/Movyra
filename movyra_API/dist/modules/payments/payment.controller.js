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
exports.createPayment = createPayment;
exports.listPayments = listPayments;
exports.getDashboardStats = getDashboardStats;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const paymentService = __importStar(require("./payment.service"));
const paymentSchema = zod_1.z.object({
    studentId: zod_1.z.string().uuid('ID do aluno inválido'),
    amount: zod_1.z.number().positive('O valor deve ser positivo'),
    status: zod_1.z.string().min(1, 'Status é obrigatório'),
    type: zod_1.z.nativeEnum(client_1.PaymentType),
    referenceMonth: zod_1.z.string().transform((str) => new Date(str)),
    paymentDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
    notes: zod_1.z.string().optional().nullable(),
});
async function createPayment(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const data = paymentSchema.parse(req.body);
        const payment = await paymentService.createPayment(tenantId, data);
        return res.status(201).json(payment);
    }
    catch (error) {
        next(error);
    }
}
async function listPayments(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const payments = await paymentService.listPayments(tenantId);
        return res.json(payments);
    }
    catch (error) {
        next(error);
    }
}
async function getDashboardStats(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const stats = await paymentService.getDashboardStats(tenantId);
        return res.json(stats);
    }
    catch (error) {
        next(error);
    }
}
