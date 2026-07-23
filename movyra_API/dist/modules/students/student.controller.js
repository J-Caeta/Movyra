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
exports.listStudents = listStudents;
exports.createStudent = createStudent;
exports.updateStudent = updateStudent;
exports.desativarStudent = desativarStudent;
const zod_1 = require("zod");
const studentService = __importStar(require("./student.service"));
const studentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome muito curto'),
    email: zod_1.z.string().email('Email inválido'),
    whatsapp: zod_1.z.string().optional().nullable(),
    dueDay: zod_1.z.number().min(1).max(31),
    plan: zod_1.z.string().min(1, 'Plano obrigatório'),
    value: zod_1.z.number().positive('O valor deve ser positivo'),
    association: zod_1.z.string().min(1, 'Vínculo obrigatório'),
    notes: zod_1.z.string().optional().nullable(),
});
async function listStudents(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const students = await studentService.listStudents(tenantId);
        return res.json(students);
    }
    catch (error) {
        next(error);
    }
}
async function createStudent(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const data = studentSchema.parse(req.body);
        const student = await studentService.createStudent(tenantId, data);
        return res.status(201).json(student);
    }
    catch (error) {
        next(error);
    }
}
async function updateStudent(req, res, next) {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;
        const data = studentSchema.parse(req.body);
        const student = await studentService.updateStudent(tenantId, id, data);
        return res.json(student);
    }
    catch (error) {
        next(error);
    }
}
async function desativarStudent(req, res, next) {
    try {
        const { id } = req.params;
        const tenantId = req.user.tenantId;
        const result = await studentService.desativarStudent(tenantId, id);
        return res.json({ message: 'Aluno desativado com sucesso', student: result });
    }
    catch (error) {
        next(error);
    }
}
