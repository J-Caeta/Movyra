"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.verifyEmail = verifyEmail;
exports.resendVerificationCode = resendVerificationCode;
exports.logout = logout;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../infrastructure/database/prisma"));
const client_1 = require("@prisma/client");
const nodemailer_1 = __importDefault(require("nodemailer"));
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});
function validarCPF(cpf) {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF))
        return false;
    let soma = 0;
    for (let i = 0; i < 9; i++)
        soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    if (digito1 !== parseInt(cleanCPF.charAt(9)))
        return false;
    soma = 0;
    for (let i = 0; i < 10; i++)
        soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    return digito2 === parseInt(cleanCPF.charAt(10));
}
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome muito curto'),
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    entityType: zod_1.z.nativeEnum(client_1.EntityType),
    cpf: zod_1.z.string().optional().nullable(),
    cref: zod_1.z.string().optional().nullable(),
    cnpj: zod_1.z.string().optional().nullable(),
    razaoSocial: zod_1.z.string().optional().nullable(),
    hasPersonal: zod_1.z.boolean().default(false),
    hasMartialArts: zod_1.z.boolean().default(false),
    hasRunning: zod_1.z.boolean().default(false),
}).refine((data) => {
    if (data.entityType === client_1.EntityType.PESSOA_FISICA) {
        if (!data.cpf)
            return false;
        return validarCPF(data.cpf);
    }
    return true;
}, {
    message: 'CPF inválido.',
    path: ['cpf'],
});
const verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    code: zod_1.z.string().length(6, 'O código deve conter 6 dígitos'),
});
const resendSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
});
// Helper: send verification email
async function sendVerificationEmail(email, code, name) {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Movyra - Gestão & Movimento'}" <${process.env.EMAIL_FROM || 'gestaomovyra@gmail.com'}>`,
            to: email,
            subject: '🔑 Código de Confirmação - Movyra',
            html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px; text-align: center;">Movyra</h2>
          <p>Olá, <strong>${name}</strong>!</p>
          <p>Obrigado por se cadastrar no Movyra. Para ativar a sua conta, utilize o código de verificação abaixo:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563EB; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expira em breve. Se você não solicitou este e-mail, por favor desconsidere.</p>
          <p style="margin-top: 30px; font-size: 11px; color: #777; font-style: italic; text-align: center;">Movyra — Onde gestão e movimento se encontram.</p>
        </div>
      `,
        });
        console.log(`✉️ Verification email sent to ${email}`);
    }
    catch (err) {
        console.error('❌ Failed to send verification email:', err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ error: 'Conta pendente de verificação de e-mail.', unverified: true });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, tenantId: user.tenantId, email: user.email, role: user.role }, process.env.JWT_SECRET || 'super-secret-key-change-in-production', { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        return res.json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
            token,
        });
    }
    catch (error) {
        next(error);
    }
}
async function register(req, res, next) {
    try {
        const data = registerSchema.parse(req.body);
        // Check if email already registered
        const existingUser = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }
        // Generate 6-digit code
        const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(data.password, salt);
        // Create Tenant and Owner user within a transaction
        const result = await prisma_1.default.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: data.name,
                    entityType: data.entityType,
                    cpf: data.entityType === client_1.EntityType.PESSOA_FISICA ? data.cpf : null,
                    cref: data.entityType === client_1.EntityType.PESSOA_FISICA ? data.cref : null,
                    cnpj: data.entityType === client_1.EntityType.PESSOA_JURIDICA ? data.cnpj : null,
                    razaoSocial: data.entityType === client_1.EntityType.PESSOA_JURIDICA ? data.razaoSocial : null,
                    hasPersonal: data.hasPersonal,
                    hasMartialArts: data.hasMartialArts,
                    hasRunning: data.hasRunning,
                },
            });
            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    name: data.name,
                    email: data.email,
                    passwordHash,
                    role: client_1.UserRole.OWNER,
                    isVerified: false,
                    verificationCode,
                },
            });
            return { tenant, user };
        });
        // Send verification email
        await sendVerificationEmail(data.email, verificationCode, data.name);
        return res.status(201).json({
            message: 'Cadastro realizado com sucesso! Verifique seu e-mail.',
            email: result.user.email,
        });
    }
    catch (error) {
        next(error);
    }
}
async function verifyEmail(req, res, next) {
    try {
        const { email, code } = verifyEmailSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: 'Este e-mail já foi verificado.' });
        }
        if (user.verificationCode !== code) {
            return res.status(400).json({ error: 'Código de verificação inválido.' });
        }
        // Mark as verified
        const updatedUser = await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null,
            },
        });
        // Auto-login upon success
        const token = jsonwebtoken_1.default.sign({ id: updatedUser.id, tenantId: updatedUser.tenantId, email: updatedUser.email, role: updatedUser.role }, process.env.JWT_SECRET || 'super-secret-key-change-in-production', { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.json({
            message: 'E-mail confirmado com sucesso!',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                tenantId: updatedUser.tenantId,
            },
            token,
        });
    }
    catch (error) {
        next(error);
    }
}
async function resendVerificationCode(req, res, next) {
    try {
        const { email } = resendSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: 'Este e-mail já foi verificado.' });
        }
        const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { verificationCode },
        });
        await sendVerificationEmail(user.email, verificationCode, user.name);
        return res.json({ message: 'Um novo código de confirmação foi enviado para seu e-mail.' });
    }
    catch (error) {
        next(error);
    }
}
function logout(req, res) {
    res.clearCookie('token');
    return res.json({ message: 'Logout realizado com sucesso' });
}
async function me(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                isVerified: true,
                tenant: {
                    select: {
                        name: true,
                        hasPersonal: true,
                        hasMartialArts: true,
                        hasRunning: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        return res.json(user);
    }
    catch (error) {
        next(error);
    }
}
