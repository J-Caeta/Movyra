"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExpenses = listExpenses;
exports.createExpense = createExpense;
exports.updateExpense = updateExpense;
exports.deleteExpense = deleteExpense;
const prisma_1 = __importDefault(require("../../infrastructure/database/prisma"));
async function listExpenses(tenantId) {
    return await prisma_1.default.expense.findMany({
        where: { tenantId },
        orderBy: { date: 'desc' },
    });
}
async function createExpense(tenantId, data) {
    return await prisma_1.default.expense.create({
        data: {
            tenantId,
            category: data.category,
            description: data.description,
            type: data.type,
            value: data.value,
            paymentMethod: data.paymentMethod,
            nature: data.nature,
            notes: data.notes,
            date: data.date || new Date(),
        },
    });
}
async function updateExpense(tenantId, id, data) {
    const existingExpense = await prisma_1.default.expense.findFirst({ where: { id, tenantId } });
    if (!existingExpense) {
        throw new Error('Despesa não encontrada ou não pertence a este tenant.');
    }
    return await prisma_1.default.expense.update({
        where: { id },
        data: {
            category: data.category,
            description: data.description,
            type: data.type,
            value: data.value,
            paymentMethod: data.paymentMethod,
            nature: data.nature,
            notes: data.notes,
            date: data.date || undefined,
        },
    });
}
async function deleteExpense(tenantId, id) {
    const existingExpense = await prisma_1.default.expense.findFirst({ where: { id, tenantId } });
    if (!existingExpense) {
        throw new Error('Despesa não encontrada ou não pertence a este tenant.');
    }
    return await prisma_1.default.expense.delete({ where: { id } });
}
