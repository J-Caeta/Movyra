"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.post('/send-inadimplentes', auth_1.requireAdmin, report_controller_1.sendInadimplentesReport);
exports.default = router;
