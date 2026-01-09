import { db } from "./db";
import {
  customers,
  appointments,
  type Customer,
  type InsertCustomer,
  type UpdateCustomerRequest,
  type Appointment,
  type InsertAppointment,
  type UpdateAppointmentRequest
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Customers
  getCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: UpdateCustomerRequest): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Appointments
  getAppointments(customerId?: number, from?: Date, to?: Date): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: UpdateAppointmentRequest): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    if (search) {
      // Simple search implementation - in real app use ilike or similar
      const all = await db.select().from(customers).orderBy(desc(customers.createdAt));
      return all.filter(c => 
        c.fullName.toLowerCase().includes(search.toLowerCase()) || 
        c.phoneNumber.includes(search)
      );
    }
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: number, updates: UpdateCustomerRequest): Promise<Customer> {
    const [updated] = await db.update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Appointments
  async getAppointments(customerId?: number, from?: Date, to?: Date): Promise<Appointment[]> {
    let conditions = [];
    
    if (customerId) conditions.push(eq(appointments.customerId, customerId));
    if (from) conditions.push(gte(appointments.appointmentTime, from));
    if (to) conditions.push(lte(appointments.appointmentTime, to));

    const query = db.select().from(appointments);
    
    if (conditions.length > 0) {
      // @ts-ignore - dizzle and/where types can be tricky with arrays
      return await query.where(and(...conditions)).orderBy(desc(appointments.appointmentTime));
    }
    
    return await query.orderBy(desc(appointments.appointmentTime));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: UpdateAppointmentRequest): Promise<Appointment> {
    const [updated] = await db.update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
}

export const storage = new DatabaseStorage();
