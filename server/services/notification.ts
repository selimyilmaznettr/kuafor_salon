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

        // Simple check for success (Netgsm usually returns ID on success, or error code)
        // Assuming if we got a response it's a "technical" success, but let's check content length or error keywords if possible.
        // For XML API, it usually returns just a code like "00 123456"
        const isSuccess = !result.startsWith("30") && !result.startsWith("40") && !result.startsWith("50") && !result.startsWith("70");

        await storage.createNotificationLog({
            type: 'sms',
            recipient: to,
            subject: 'SMS Notification',
            status: isSuccess ? 'success' : 'error',
            errorMessage: isSuccess ? null : `NetGsm Error: ${result}`
        });
        return true;
    } catch (error) {
        console.error("[SMS][ERROR] Failed to send SMS:", error);
        await storage.createNotificationLog({
            type: 'sms',
            recipient: to,
            subject: 'SMS Notification',
            status: 'error',
            errorMessage: error instanceof Error ? error.message : String(error)
        });
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
        await storage.createNotificationLog({
            type: 'email',
            recipient: to,
            subject: subject,
            status: 'success',
            errorMessage: null
        });
        return true;

    } catch (error) {
        console.error("[EMAIL][ERROR] Failed to send email:", error);
        await storage.createNotificationLog({
            type: 'email',
            recipient: to,
            subject: subject,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : String(error)
        });
        return false;
    }
}
