import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  notes: text("notes"), // General preferences
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: integer("duration").notNull().default(30), // in minutes
  price: integer("price").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  isActive: boolean("is_active").notNull().default(true),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  serviceId: integer("service_id"),
  employeeId: integer("employee_id"),
  serviceType: text("service_type").notNull(),
  appointmentTime: timestamp("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  price: integer("price"),
  notes: text("notes"),
  notificationSent: boolean("notification_sent").default(false),
  reminderCount: integer("reminder_count").default(0),
  lastReminderSentAt: timestamp("last_reminder_sent_at"),
});

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),

  // Netgsm Settings
  netgsmUser: text("netgsm_user").default(""),
  netgsmPassword: text("netgsm_password").default(""),
  netgsmHeader: text("netgsm_header").default(""),
  smsEnabled: boolean("sms_enabled").default(false),

  // Email Settings
  smtpHost: text("smtp_host").default(""),
  smtpPort: integer("smtp_port").default(587),
  smtpUser: text("smtp_user").default(""),
  smtpPass: text("smtp_pass").default(""),
  emailEnabled: boolean("email_enabled").default(false),
});

export const notificationLogs = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'email' | 'sms'
  recipient: text("recipient").notNull(),
  subject: text("subject"), // For emails
  status: text("status").notNull(), // 'success' | 'error'
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow(),
});

// === RELATIONS ===
export const customersRelations = relations(customers, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  employee: one(employees, {
    fields: [appointments.employeeId],
    references: [employees.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments, {
  appointmentTime: z.coerce.date(),
}).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = typeof notificationLogs.$inferInsert;

// Request types
export type CreateCustomerRequest = InsertCustomer;
export type UpdateCustomerRequest = Partial<InsertCustomer>;
export type CreateAppointmentRequest = InsertAppointment;
export type UpdateAppointmentRequest = Partial<InsertAppointment>;
export type CreateServiceRequest = InsertService;
export type UpdateServiceRequest = Partial<InsertService>;
export type CreateEmployeeRequest = InsertEmployee;
export type UpdateEmployeeRequest = Partial<InsertEmployee>;

// Response types
export type CustomerResponse = Customer;
export type AppointmentResponse = Appointment & { customer?: Customer }; // Optional join
