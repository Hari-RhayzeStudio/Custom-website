import express from 'express';
import twilio from 'twilio';
import crypto from 'crypto';
import { prismaUser } from '../utils/prismaClients';

const router = express.Router();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const SERVICE_SID = process.env.TWILIO_SERVICE_SID!;

router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: "Phone required" });
  try {
    const ver = await twilioClient.verify.v2.services(SERVICE_SID).verifications.create({ to: phoneNumber, channel: 'sms' });
    res.json({ success: true, status: ver.status });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, code, name } = req.body;
  if (!phoneNumber || !code) return res.status(400).json({ error: "Missing data" });

  try {
    const check = await twilioClient.verify.v2.services(SERVICE_SID).verificationChecks.create({ to: phoneNumber, code });
    if (check.status !== 'approved') return res.status(400).json({ error: "Invalid OTP" });

    let user = await prismaUser.user.findFirst({ where: { phone_number: phoneNumber } });
    if (!user) {
      user = await prismaUser.user.create({
        data: { id: crypto.randomUUID(), phone_number: phoneNumber, full_name: name || "Guest", email: null, age: null }
      });
    } else if (name) {
      user = await prismaUser.user.update({ where: { id: user.id }, data: { full_name: name } });
    }
    res.json({ success: true, user });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;