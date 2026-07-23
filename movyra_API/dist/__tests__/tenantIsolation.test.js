"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const report_controller_1 = require("../modules/reports/report.controller");
const prisma_1 = __importDefault(require("../infrastructure/database/prisma"));
const client_1 = require("@prisma/client");
jest.mock('../infrastructure/database/prisma', () => ({
    __esModule: true,
    default: {
        student: {
            findMany: jest.fn(),
        },
    },
}));
describe('Tenant Isolation Tests', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });
    it('should filter reports by tenantId of the authenticated user', async () => {
        // Arrange: Mock authenticated user with a specific tenantId
        mockRequest.user = {
            id: 'user-id-123',
            tenantId: 'tenant-academy-A',
            email: 'owner@academy-a.com',
            role: 'OWNER',
        };
        // Arrange: Mock Prisma findMany to return empty or mock data
        const findManyMock = prisma_1.default.student.findMany;
        findManyMock.mockResolvedValue([]);
        // Act
        await (0, report_controller_1.sendInadimplentesReport)(mockRequest, mockResponse, nextFunction);
        // Assert: Check that prisma.student.findMany was called with where.tenantId = 'tenant-academy-A'
        expect(findManyMock).toHaveBeenCalledTimes(1);
        expect(findManyMock).toHaveBeenCalledWith({
            where: {
                tenantId: 'tenant-academy-A',
                status: client_1.StudentStatus.INADIMPLENTE,
            },
            orderBy: {
                dueDay: 'asc',
            },
        });
        // Assert: Verification that no error was forwarded
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
