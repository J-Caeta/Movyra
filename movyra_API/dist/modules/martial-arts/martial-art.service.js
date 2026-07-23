"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProgress = listProgress;
exports.updateProgress = updateProgress;
exports.promoteAthlete = promoteAthlete;
const prisma_1 = __importDefault(require("../../infrastructure/database/prisma"));
async function listProgress(tenantId) {
    const progressList = await prisma_1.default.martialArtProgress.findMany({
        where: {
            student: { tenantId }
        },
        include: {
            student: {
                select: { name: true, code: true }
            }
        },
        orderBy: {
            student: { name: 'asc' }
        }
    });
    return progressList.map((p) => {
        const monthsOnBelt = Math.max(0, Math.floor((new Date().getTime() - new Date(p.lastPromotion).getTime()) / (1000 * 60 * 60 * 24 * 30.4)));
        const isEligibleForPromotion = monthsOnBelt >= 12;
        return {
            ...p,
            monthsOnBelt,
            isEligibleForPromotion,
        };
    });
}
async function updateProgress(tenantId, studentId, data) {
    const student = await prisma_1.default.student.findFirst({
        where: { id: studentId, tenantId },
    });
    if (!student) {
        throw new Error('Aluno não encontrado ou não pertence a este tenant.');
    }
    return await prisma_1.default.martialArtProgress.upsert({
        where: { studentId },
        update: {
            martialArt: data.martialArt,
            currentBelt: data.currentBelt,
            degree: data.degree,
            notes: data.notes,
        },
        create: {
            studentId,
            martialArt: data.martialArt,
            currentBelt: data.currentBelt,
            degree: data.degree,
            notes: data.notes,
        },
    });
}
async function promoteAthlete(tenantId, studentId, data) {
    const student = await prisma_1.default.student.findFirst({
        where: { id: studentId, tenantId },
    });
    if (!student) {
        throw new Error('Aluno não encontrado ou não pertence a este tenant.');
    }
    return await prisma_1.default.martialArtProgress.update({
        where: { studentId },
        data: {
            martialArt: data.martialArt,
            currentBelt: data.currentBelt,
            degree: data.degree,
            lastPromotion: new Date(),
            notes: data.notes,
        },
    });
}
