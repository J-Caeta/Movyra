"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Domain Routers from Modules
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const student_routes_1 = __importDefault(require("./modules/students/student.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const expense_routes_1 = __importDefault(require("./modules/expenses/expense.routes"));
const martial_art_routes_1 = __importDefault(require("./modules/martial-arts/martial-art.routes"));
const report_routes_1 = __importDefault(require("./modules/reports/report.routes"));
const router = (0, express_1.Router)();
// Mount Routers
router.use('/auth', auth_routes_1.default);
router.use('/students', student_routes_1.default);
router.use('/payments', payment_routes_1.default);
router.use('/expenses', expense_routes_1.default);
router.use('/martial-art', martial_art_routes_1.default);
router.use('/reports', report_routes_1.default);
// Compatibility fallback for dashboard stats
const payment_controller_1 = require("./modules/payments/payment.controller");
const auth_1 = require("./middlewares/auth");
router.get('/dashboard/stats', auth_1.authMiddleware, payment_controller_1.getDashboardStats);
exports.default = router;
