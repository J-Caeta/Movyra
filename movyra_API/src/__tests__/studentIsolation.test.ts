import { Request, Response } from 'express';
import { listStudents, createStudent } from '../modules/students/student.controller';
import * as studentService from '../modules/students/student.service';

jest.mock('../modules/students/student.service', () => ({
  listStudents: jest.fn(),
  createStudent: jest.fn(),
}));

describe('Student Isolation Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should list students filtered by tenantId of authenticated user', async () => {
    mockRequest.user = {
      id: 'user-1',
      tenantId: 'tenant-personal-A',
      email: 'personal@academy.com',
      role: 'OWNER',
    };

    const listMock = studentService.listStudents as jest.Mock;
    listMock.mockResolvedValue([{ id: 'student-1', name: 'John Doe', tenantId: 'tenant-personal-A' }]);

    await listStudents(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledWith('tenant-personal-A');
    expect(mockResponse.json).toHaveBeenCalledWith([{ id: 'student-1', name: 'John Doe', tenantId: 'tenant-personal-A' }]);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should create student with tenantId of authenticated user', async () => {
    mockRequest.user = {
      id: 'user-1',
      tenantId: 'tenant-personal-A',
      email: 'personal@academy.com',
      role: 'OWNER',
    };
    mockRequest.body = {
      name: 'Jane Doe',
      email: 'jane@doe.com',
      whatsapp: '11999999999',
      dueDay: 15,
      plan: 'Mensal',
      value: 120,
      association: 'Personal',
    };

    const createMock = studentService.createStudent as jest.Mock;
    createMock.mockResolvedValue({ id: 'student-2', name: 'Jane Doe', tenantId: 'tenant-personal-A' });

    await createStudent(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith('tenant-personal-A', expect.objectContaining({
      name: 'Jane Doe',
      email: 'jane@doe.com',
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
