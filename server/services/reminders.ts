
import { db } from "../db.js";
import { appointments, customers, notificationSettings } from "../../shared/schema.js";
import { eq, and, gte, lte, lt, or, isNull, sql } from "drizzle-orm";
import { sendEmail, sendSMS } from "./notification.js";
import { storage } from "../storage.js";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export async function checkAndSendReminders() {
    console.log("[Reminders] Checking for upcoming appointments...");

    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000); // Now + 30m

    // Find appointments:
    // 1. Scheduled
    // 2. Time is between NOW and NOW + 30 mins
    // 3. Reminder count < 3
    const upcomingAppointments = await db.select({
        appointment: appointments,
        customer: customers
    })
        .from(appointments)
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .where(and(
            eq(appointments.status, 'scheduled'),
            gte(appointments.appointmentTime, now),
            lte(appointments.appointmentTime, thirtyMinutesFromNow),
            lt(appointments.reminderCount, 3)
        ));

    console.log(`[Reminders] Found ${upcomingAppointments.length} candidates in the next 30 mins.`);

    for (const { appointment, customer } of upcomingAppointments) {
        // Check 10 minute interval
        if (appointment.lastReminderSentAt) {
            const timeSinceLast = now.getTime() - new Date(appointment.lastReminderSentAt).getTime();
            const minutesSinceLast = timeSinceLast / (1000 * 60);

            if (minutesSinceLast < 10) {
                console.log(`[Reminders] Skipping appt ${appointment.id}, last reminder was ${minutesSinceLast.toFixed(1)} mins ago.`);
                continue;
            }
        }

        // Send Reminder
        console.log(`[Reminders] Sending reminder ${appointment.reminderCount + 1}/3 for appt ${appointment.id}`);

        const settings = await storage.getNotificationSettings();
        const timeStr = format(appointment.appointmentTime, "HH:mm", { locale: tr });
        const msg = `Sayın ${customer.fullName}, randevunuza 30 dakikadan az kaldı! (${timeStr})`;

        // Try Email
        if (settings.emailEnabled && customer.email) {
            await sendEmail(customer.email, "Randevu Hatırlatması", msg);
        }

        // Try SMS
        // if (settings.smsEnabled && customer.phoneNumber) {
        //     await sendSMS(customer.phoneNumber, msg);
        // }

        // Update DB
        await db.update(appointments)
            .set({
                reminderCount: (appointment.reminderCount || 0) + 1,
                lastReminderSentAt: new Date()
            })
            .where(eq(appointments.id, appointment.id));
    }
}
