import cron from "node-cron";
import { db } from "./db";
import { appointments, customers } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendSMS, sendEmail } from "./services/notification";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function setupCronJobs() {
    console.log("Initializing Cron Jobs...");

    // Run every minute
    cron.schedule("* * * * *", async () => {
        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const thirtyOneMinutesFromNow = new Date(now.getTime() + 31 * 60 * 1000);

        try {
            // Find appointments scheduled between 30 and 31 minutes from now
            // This window prevents double sending if the cron takes a few seconds,
            // coupled with the 'notificationSent' flag check.
            const upcomingAppointments = await db
                .select({
                    appointment: appointments,
                    customer: customers,
                })
                .from(appointments)
                .leftJoin(customers, eq(appointments.customerId, customers.id))
                .where(
                    and(
                        eq(appointments.notificationSent, false),
                        gte(appointments.appointmentTime, thirtyMinutesFromNow),
                        lte(appointments.appointmentTime, thirtyOneMinutesFromNow),
                        eq(appointments.status, "scheduled") // Only send for scheduled appointments
                    )
                );

            if (upcomingAppointments.length > 0) {
                console.log(`Found ${upcomingAppointments.length} upcoming appointments to notify.`);
            }

            for (const { appointment, customer } of upcomingAppointments) {
                if (!customer) continue;

                const timeString = format(appointment.appointmentTime, "HH:mm", { locale: tr });
                const message = `Sayın ${customer.fullName}, randevunuz ${timeString} saatinde başlayacaktır. Lütfen 5 dakika önce geliniz.`;

                // Send SMS
                await sendSMS(customer.phoneNumber, message);

                // Send Email if exists
                if (customer.email) {
                    await sendEmail(
                        customer.email,
                        "Randevu Hatırlatması",
                        `Merhaba ${customer.fullName},\n\n${message}\n\nTeşekkürler.`
                    );
                }

                // Mark as sent
                await db
                    .update(appointments)
                    .set({ notificationSent: true })
                    .where(eq(appointments.id, appointment.id));
            }
        } catch (error) {
            console.error("Error in notification cron job:", error);
        }
    });
}
