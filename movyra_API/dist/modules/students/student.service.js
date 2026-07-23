"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineStudentStatus = determineStudentStatus;
exports.listStudents = listStudents;
exports.createStudent = createStudent;
exports.updateStudent = updateStudent;
exports.desativarStudent = desativarStudent;
const prisma_1 = __importDefault(require("../../infrastructure/database/prisma"));
const client_1 = require("@prisma/client");
async function determineStudentStatus(studentId) {
    const student = await prisma_1.default.student.findUnique({
        where: { id: studentId },
        include: { payments: true }
    });
    if (!student)
        return client_1.StudentStatus.INATIVO;
    if (student.status === client_1.StudentStatus.INATIVO)
        return client_1.StudentStatus.INATIVO;
    const now = new Date();
    const paidThisMonth = student.payments.some(p => {
        const ref = new Date(p.referenceMonth);
        return ref.getFullYear() === now.getFullYear() && ref.getMonth() === now.getMonth() && p.status === 'PAGO';
    });
    if (paidThisMonth) {
        return client_1.StudentStatus.ADIMPLENTE;
    }
    const dueDate = new Date(now.getFullYear(), now.getMonth(), student.dueDay);
    if (now > dueDate) {
        return client_1.StudentStatus.INADIMPLENTE;
    }
    return client_1.StudentStatus.EM_ABERTO;
}
async function listStudents(tenantId) {
    const students = await prisma_1.default.student.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
    });
    // Dynamically update status before sending
    return await Promise.all(students.map(async (s) => {
        const newStatus = await determineStudentStatus(s.id);
        if (s.status !== newStatus) {
            return await prisma_1.default.student.update({
                where: { id: s.id },
                data: { status: newStatus },
            });
        }
        return s;
    }));
}
async function createStudent(tenantId, data) {
    const count = await prisma_1.default.student.count({ where: { tenantId } });
    const nextCodeNumber = count + 1;
    const code = `MOVYRA-${String(nextCodeNumber).padStart(3, '0')}`;
    const student = await prisma_1.default.student.create({
        data: {
            tenantId,
            code,
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
            dueDay: data.dueDay,
            plan: data.plan,
            value: data.value,
            status: client_1.StudentStatus.EM_ABERTO,
            association: data.association,
            notes: data.notes,
        },
    });
    if (data.association === 'Lutas') {
        await prisma_1.default.martialArtProgress.create({
            data: {
                studentId: student.id,
                martialArt: 'Jiu-Jitsu',
                currentBelt: 'Branca',
                degree: 0,
                notes: 'Ficha de graduação criada automaticamente.',
            },
        });
    }
    const status = await determineStudentStatus(student.id);
    return await prisma_1.default.student.update({
        where: { id: student.id },
        data: { status }
    });
}
async function updateStudent(tenantId, id, data) {
    const existingStudent = await prisma_1.default.student.findFirst({ where: { id, tenantId } });
    if (!existingStudent) {
        throw new Error('Aluno não encontrado ou não pertence a este tenant.');
    }
    const student = await prisma_1.default.student.update({
        where: { id },
        data: {
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
            dueDay: data.dueDay,
            plan: data.plan,
            value: data.value,
            association: data.association,
            notes: data.notes,
        },
    });
    if (data.association === 'Lutas') {
        const progress = await prisma_1.default.martialArtProgress.findUnique({ where: { studentId: id } });
        if (!progress) {
            await prisma_1.default.martialArtProgress.create({
                data: {
                    studentId: id,
                    martialArt: 'Jiu-Jitsu',
                    currentBelt: 'Branca',
                    degree: 0,
                },
            });
        }
    }
    const status = await determineStudentStatus(student.id);
    return await prisma_1.default.student.update({
        where: { id },
        data: { status },
    });
}
async function desativarStudent(tenantId, id) {
    const existingStudent = await prisma_1.default.student.findFirst({ where: { id, tenantId } });
    if (!existingStudent) {
        throw new Error('Aluno não encontrado ou não pertence a este tenant.');
    }
    return await prisma_1.default.student.update({
        where: { id },
        data: { status: client_1.StudentStatus.INATIVO },
    });
}
