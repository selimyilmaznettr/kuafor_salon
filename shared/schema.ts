import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  notes: text("notes"), // General preferences (e.g., "Likes coffee", "Sensitive scalp")
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()), // Default now
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  duration: integer("duration").notNull().default(30), // in minutes
  price: integer("price").notNull().default(0),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
});

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role"),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  serviceId: integer("service_id"), // Nullable for migration/legacy
  employeeId: integer("employee_id"), // Nullable initially
  serviceType: text("service_type").notNull(), // Keep for legacy string support or display name
  appointmentTime: integer("appointment_time", { mode: 'timestamp' }).notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  price: integer("price"), // Price in currency units
  notes: text("notes"), // Specific notes for this appointment
  notificationSent: integer("notification_sent", { mode: 'boolean' }).default(false),
});

export const notificationSettings = sqliteTable("notification_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Netgsm Settings
  netgsmUser: text("netgsm_user").default(""),
  netgsmPassword: text("netgsm_password").default(""),
  netgsmHeader: text("netgsm_header").default(""),
  smsEnabled: integer("sms_enabled", { mode: 'boolean' }).default(false),

  // Email Settings
  smtpHost: text("smtp_host").default(""),
  smtpPort: integer("smtp_port").default(587),
  smtpUser: text("smtp_user").default(""),
  smtpPass: text("smtp_pass").default(""),
  emailEnabled: integer("email_enabled", { mode: 'boolean' }).default(false),
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
