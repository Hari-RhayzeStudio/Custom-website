"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const twilio_1 = __importDefault(require("twilio"));
const crypto_1 = __importDefault(require("crypto"));
const prismaClients_1 = require("../utils/prismaClients");
const router = express_1.default.Router();
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const SERVICE_SID = process.env.TWILIO_SERVICE_SID;
router.post('/send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber } = req.body;
    if (!phoneNumber)
        return res.status(400).json({ error: "Phone required" });
    try {
        const ver = yield twilioClient.verify.v2.services(SERVICE_SID).verifications.create({ to: phoneNumber, channel: 'sms' });
        res.json({ success: true, status: ver.status });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
router.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, code, name } = req.body;
    if (!phoneNumber || !code)
        return res.status(400).json({ error: "Missing data" });
    try {
        const check = yield twilioClient.verify.v2.services(SERVICE_SID).verificationChecks.create({ to: phoneNumber, code });
        if (check.status !== 'approved')
            return res.status(400).json({ error: "Invalid OTP" });
        let user = yield prismaClients_1.prismaUser.user.findFirst({ where: { phone_number: phoneNumber } });
        if (!user) {
            user = yield prismaClients_1.prismaUser.user.create({
                data: { id: crypto_1.default.randomUUID(), phone_number: phoneNumber, full_name: name || "Guest", email: null, age: null }
            });
        }
        else if (name) {
            user = yield prismaClients_1.prismaUser.user.update({ where: { id: user.id }, data: { full_name: name } });
        }
        res.json({ success: true, user });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
exports.default = router;
