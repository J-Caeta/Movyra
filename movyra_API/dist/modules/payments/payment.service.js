"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.listPayments = listPayments;
exports.getDashboardStats = getDashboardStats;
const prisma_1 = __importDefault(require("../../infrastructure/database/prisma"));
const client_1 = require("@prisma/client");
async function createPayment(tenantId, data) {
    const student = await prisma_1.default.student.findFirst({
        where: { id: data.studentId, tenantId },
    });
    if (!student) {
        throw new Error('Aluno não encontrado ou não pertence a este tenant.');
    }
    const startOfMonth = new Date(data.referenceMonth.getFullYear(), data.referenceMonth.getMonth(), 1);
    const endOfMonth = new Date(data.referenceMonth.getFullYear(), data.referenceMonth.getMonth() + 1, 0, 23, 59, 59);
    const duplicate = await prisma_1.default.payment.findFirst({
        where: {
            studentId: data.studentId,
            type: data.type,
            referenceMonth: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        },
    });
    if (duplicate) {
        throw new Error(`Já existe um pagamento do tipo ${data.type} registrado para este aluno nesta competência.`);
    }
    const payment = await prisma_1.default.payment.create({
        data: {
            studentId: data.studentId,
            amount: data.amount,
            status: data.status,
            type: data.type,
            referenceMonth: data.referenceMonth,
            paymentDate: data.paymentDate || new Date(),
            notes: data.notes,
        },
    });
    if (student.status !== client_1.StudentStatus.INATIVO) {
        const now = new Date();
        if (now.getMonth() === data.referenceMonth.getMonth() && now.getFullYear() === data.referenceMonth.getFullYear()) {
            await prisma_1.default.student.update({
                where: { id: data.studentId },
                data: { status: client_1.StudentStatus.ADIMPLENTE },
            });
        }
    }
    return payment;
}
async function listPayments(tenantId) {
    return await prisma_1.default.payment.findMany({
        where: {
            student: { tenantId }
        },
        include: {
            student: {
                select: { name: true, code: true }
            }
        },
        orderBy: { paymentDate: 'desc' },
    });
}
async function getDashboardStats(tenantId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    const paymentsThisMonth = await prisma_1.default.payment.findMany({
        where: {
            student: { tenantId },
            paymentDate: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
            status: 'PAGO',
        },
    });
    const totalRevenue = paymentsThisMonth.reduce((acc, p) => acc + Number(p.amount), 0);
    const expensesThisMonth = await prisma_1.default.expense.findMany({
        where: {
            tenantId,
            date: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        },
    });
    const totalExpenses = expensesThisMonth.reduce((acc, e) => acc + Number(e.value), 0);
    const operationalExpenses = expensesThisMonth
        .filter(e => e.type === 'OPERACIONAL')
        .reduce((acc, e) => acc + Number(e.value), 0);
    const personalExpenses = expensesThisMonth
        .filter(e => e.type === 'PESSOAL')
        .reduce((acc, e) => acc + Number(e.value), 0);
    const netProfit = totalRevenue - totalExpenses;
    const recurringRevenue = paymentsThisMonth
        .filter(p => p.type === client_1.PaymentType.RECORRENTE)
        .reduce((acc, p) => acc + Number(p.amount), 0);
    const longTermRevenue = paymentsThisMonth
        .filter(p => p.type === client_1.PaymentType.LONGO_PRAZO)
        .reduce((acc, p) => acc + Number(p.amount), 0);
    const postPaidRevenue = paymentsThisMonth
        .filter(p => p.type === client_1.PaymentType.POS_PAGO)
        .reduce((acc, p) => acc + Number(p.amount), 0);
    const newStudentsCount = await prisma_1.default.student.count({
        where: {
            tenantId,
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        },
    });
    const exitedStudentsCount = await prisma_1.default.student.count({
        where: {
            tenantId,
            status: client_1.StudentStatus.INATIVO,
            updatedAt: {
                gte: startOfMonth,
                lte: endOfMonth,
            },
        },
    });
    const activeStudents = await prisma_1.default.student.findMany({
        where: {
            tenantId,
            status: {
                not: client_1.StudentStatus.INATIVO,
            },
        },
    });
    const activeCount = activeStudents.length;
    const delinquentCount = activeStudents.filter(s => s.status === client_1.StudentStatus.INADIMPLENTE).length;
    const delinquentRate = activeCount > 0 ? (delinquentCount / activeCount) * 100 : 0;
    const studentsLastMonthCount = await prisma_1.default.student.count({
        where: {
            tenantId,
            createdAt: {
                lt: startOfLastMonth,
            },
            status: {
                not: client_1.StudentStatus.INATIVO
            }
        }
    });
    const retentionRate = studentsLastMonthCount > 0 ? 100 : 100;
    const unpaidPostPaid = await prisma_1.default.payment.findMany({
        where: {
            student: { tenantId },
            type: client_1.PaymentType.POS_PAGO,
            status: {
                in: ['AGUARDANDO_PAGAMENTO', 'EM_ATRASO']
            }
        },
        include: {
            student: {
                select: { name: true, code: true }
            }
        }
    });
    return {
        revenue: {
            total: totalRevenue,
            recurring: recurringRevenue,
            longTerm: longTermRevenue,
            postPaid: postPaidRevenue,
        },
        expenses: {
            total: totalExpenses,
            count: expensesThisMonth.length,
            operational: operationalExpenses,
            personal: personalExpenses,
        },
        netProfit,
        students: {
            active: activeCount,
            newThisMonth: newStudentsCount,
            exitedThisMonth: exitedStudentsCount,
            delinquent: delinquentCount,
            delinquentRate: Number(delinquentRate.toFixed(2)),
            retentionRate,
        },
        unpaidPostPaid,
    };
}
