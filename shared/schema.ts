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
  notes: text("notes"), // General preferences (e.g., "Likes coffee", "Sensitive scalp")
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  serviceType: text("service_type").notNull(), // Cut, Color, Blowdry, etc.
  appointmentTime: timestamp("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  price: integer("price"), // Price in currency units
  notes: text("notes"), // Specific notes for this appointment
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
}));

// === BASE SCHEMAS ===
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Request types
export type CreateCustomerRequest = InsertCustomer;
export type UpdateCustomerRequest = Partial<InsertCustomer>;
export type CreateAppointmentRequest = InsertAppointment;
export type UpdateAppointmentRequest = Partial<InsertAppointment>;

// Response types
export type CustomerResponse = Customer;
export type AppointmentResponse = Appointment & { customer?: Customer }; // Optional join
