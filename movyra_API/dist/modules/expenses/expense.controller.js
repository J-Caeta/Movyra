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
exports.listExpenses = listExpenses;
exports.createExpense = createExpense;
exports.updateExpense = updateExpense;
exports.deleteExpense = deleteExpense;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const expenseService = __importStar(require("./expense.service"));
const expenseSchema = zod_1.z.object({
    category: zod_1.z.string().min(1, 'Categoria obrigatória'),
    description: zod_1.z.string().min(1, 'Descrição obrigatória'),
    type: zod_1.z.nativeEnum(client_1.ExpenseType),
    value: zod_1.z.number().positive('O valor deve ser positivo'),
    paymentMethod: zod_1.z.string().min(1, 'Método de pagamento obrigatório'),
    nature: zod_1.z.string().min(1, 'Natureza da despesa obrigatória (ex: Fixo, Variável)'),
    notes: zod_1.z.string().optional().nullable(),
    date: zod_1.z.string().transform((str) => new Date(str)).optional(),
});
async function listExpenses(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const expenses = await expenseService.listExpenses(tenantId);
        return res.json(expenses);
    }
    catch (error) {
        next(error);
    }
}
async function createExpense(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const data = expenseSchema.parse(req.body);
        const expense = await expenseService.createExpense(tenantId, data);
        return res.status(201).json(expense);
    }
    catch (error) {
        next(error);
    }
}
async function updateExpense(req, res, next) {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;
        const data = expenseSchema.parse(req.body);
        const expense = await expenseService.updateExpense(tenantId, id, data);
        return res.json(expense);
    }
    catch (error) {
        next(error);
    }
}
async function deleteExpense(req, res, next) {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;
        await expenseService.deleteExpense(tenantId, id);
        return res.json({ message: 'Despesa excluída com sucesso' });
    }
    catch (error) {
        next(error);
    }
}
