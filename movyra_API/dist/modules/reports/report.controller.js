"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInadimplentesReport = sendInadimplentesReport;
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = __importDefault(require("../../infrastructure/database/prisma"));
const client_1 = require("@prisma/client");
async function sendInadimplentesReport(req, res, next) {
    try {
        const tenantId = req.user.tenantId;
        const listInadimplentes = await prisma_1.default.student.findMany({
            where: {
                tenantId,
                status: client_1.StudentStatus.INADIMPLENTE,
            },
            orderBy: {
                dueDay: 'asc',
            },
        });
        if (listInadimplentes.length === 0) {
            return res.json({ message: 'Nenhum aluno inadimplente encontrado. Relatório não enviado.' });
        }
        const dataHoje = new Date().toLocaleDateString('pt-BR');
        // Create styled email table
        let tableRows = '';
        listInadimplentes.forEach(aluno => {
            tableRows += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${aluno.name}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${aluno.email || 'Não informado'}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center; color: #c62828; font-weight: bold;">Dia ${aluno.dueDay}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">R$ ${Number(aluno.value).toFixed(2)}</td>
        </tr>
      `;
        });
        const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #c62828; border-bottom: 2px solid #c62828; padding-bottom: 10px;">
          🚨 Relatório de Inadimplentes - ${dataHoje}
        </h2>
        <p>Olá, equipe Movyra!</p>
        <p>Segue a lista de alunos com pendências financeiras identificadas até o momento:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Aluno</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">E-mail</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Vencimento</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <p style="margin-top: 30px; color: #777; font-size: 11px; font-style: italic; text-align: center;">
          Relatório gerado automaticamente pelo novo Movyra - Onde gestão e movimento se encontram..
        </p>
      </div>
    `;
        // Configure Mailer
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Movyra - Onde gestão e movimento se encontram.'}" <${process.env.EMAIL_FROM || 'gestaomovyra@gmail.com'}>`,
            to: 'eucaeetano@gmail.com, movyraflavio@gmail.com, gestaomovyra@gmail.com',
            subject: `🚨 Relatório de Inadimplentes - ${dataHoje}`,
            html: htmlBody,
        });
        console.log('✅ Email sent: %s', info.messageId);
        return res.json({
            message: 'Relatório de inadimplentes gerado e enviado com sucesso por e-mail!',
            inadimplentesCount: listInadimplentes.length,
        });
    }
    catch (error) {
        next(error);
    }
}
