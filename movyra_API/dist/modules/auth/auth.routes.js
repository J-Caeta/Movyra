"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
// Public
router.post('/login', auth_controller_1.login);
router.post('/register', auth_controller_1.register);
router.post('/verify-email', auth_controller_1.verifyEmail);
router.post('/resend-code', auth_controller_1.resendVerificationCode);
router.post('/logout', auth_controller_1.logout);
// Protected
router.get('/me', auth_1.authMiddleware, auth_controller_1.me);
exports.default = router;
