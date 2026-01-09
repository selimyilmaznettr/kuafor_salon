import nodemailer from "nodemailer";
import { storage } from "../storage";

export async function sendSMS(to: string, message: string): Promise<boolean> {
    const settings = await storage.getNotificationSettings();

    if (!settings.smsEnabled) {
        console.log("[SMS][INFO] SMS Disabled in settings. Skipping.");
        return false;
    }

    // Check if Netgsm credentials are present
    if (!settings.netgsmUser || !settings.netgsmPassword || !settings.netgsmHeader) {
        console.log(`[SMS][MOCK] To: ${to} | Msg: ${message}`);
        console.log("[SMS][INFO] Missing credentials, skipping real send.");
        return false;
    }

    try {
        const xmlBody = `<?xml version="1.0"?>
<mainbody>
    <header>
        <company dil="TR">Netgsm</company>
        <usercode>${settings.netgsmUser}</usercode>
        <password>${settings.netgsmPassword}</password>
        <type>1:n</type>
        <msgheader>${settings.netgsmHeader}</msgheader>
    </header>
    <body>
        <msg><![CDATA[${message}]]></msg>
        <no>${to}</no>
    </body>
</mainbody>`;

        const response = await fetch("https://api.netgsm.com.tr/sms/send/xml", {
            method: "POST",
            headers: {
                "Content-Type": "text/xml",
            },
            body: xmlBody,
        });

        const result = await response.text();
        console.log(`[SMS][NETGSM] Response: ${result}`);
        return true;
    } catch (error) {
        console.error("[SMS][ERROR] Failed to send SMS:", error);
        return false;
    }
}

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const settings = await storage.getNotificationSettings();

    if (!settings.emailEnabled) {
        console.log("[EMAIL][INFO] Email Disabled in settings. Skipping.");
        return false;
    }

    // Check if SMTP credentials are present
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
        console.log(`[EMAIL][MOCK] To: ${to} | Subject: ${subject}`);
        console.log("[EMAIL][INFO] Missing SMTP credentials, skipping real send.");
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort || 587,
            secure: settings.smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: `"Salon Takip" <${settings.smtpUser}>`,
            to: to,
            subject: subject,
            text: body,
        });

        console.log(`[EMAIL] Message sent: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error("[EMAIL][ERROR] Failed to send email:", error);
        return false;
    }
}
