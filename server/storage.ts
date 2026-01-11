import { db } from "./db.js";
import {
  customers,
  appointments,
  services,
  employees,
  type Customer,
  type InsertCustomer,
  type UpdateCustomerRequest,
  type Appointment,
  type InsertAppointment,
  type UpdateAppointmentRequest,
  type Service,
  type InsertService,
  type UpdateServiceRequest,
  type Employee,
  type InsertEmployee,
  type UpdateEmployeeRequest,
  type NotificationSettings,
  type InsertNotificationSettings,
  notificationSettings,
  type NotificationLog,
  type InsertNotificationLog,
  notificationLogs
} from "../shared/schema.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: UpdateServiceRequest): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: UpdateEmployeeRequest): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;

  getDashboardStats(): Promise<{
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalCustomers: number;
    todayAppointments: number;
    recentActivity: Appointment[];
  }>;

  getReportStats(from: Date, to: Date): Promise<{
    summary: {
      totalRevenue: number;
      totalAppointments: number;
      averageOrderValue: number;
      newCustomers: number;
    };
    dailyTrend: { date: string; revenue: number; count: number }[];
    servicePerformance: { name: string; revenue: number; count: number }[];
    employeePerformance: { name: string; revenue: number; count: number }[];
  }>;

  // Notification Settings
  getNotificationSettings(): Promise<NotificationSettings>;
  updateNotificationSettings(settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings>;

  // Notification Logs
  getNotificationLogs(): Promise<NotificationLog[]>;
  createNotificationLog(log: InsertNotificationLog): Promise<NotificationLog>;
}

export class DatabaseStorage implements IStorage {
  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, updates: UpdateServiceRequest): Promise<Service> {
    const [updated] = await db.update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    // Soft delete
    await db.update(services).set({ isActive: false }).where(eq(services.id, id));
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.isActive, true));
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async updateEmployee(id: number, updates: UpdateEmployeeRequest): Promise<Employee> {
    const [updated] = await db.update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return updated;
  }

  async deleteEmployee(id: number): Promise<void> {
    // Soft delete
    await db.update(employees).set({ isActive: false }).where(eq(employees.id, id));
  }

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

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalCustomers: number;
    todayAppointments: number;
    recentActivity: Appointment[];
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of Week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const allAppointments = await db.select().from(appointments);
    const activeCustomers = await db.select().from(customers); // count, ideally simple count query

    // Helper calculate revenue
    const calcRevenue = (apps: Appointment[]) =>
      apps
        .filter(a => a.status === 'completed' && a.price)
        .reduce((sum, a) => sum + (a.price || 0), 0);

    const dailyRevenue = calcRevenue(allAppointments.filter(a => new Date(a.appointmentTime) >= startOfDay));
    const weeklyRevenue = calcRevenue(allAppointments.filter(a => new Date(a.appointmentTime) >= startOfWeek));
    const monthlyRevenue = calcRevenue(allAppointments.filter(a => new Date(a.appointmentTime) >= startOfMonth));
    const yearlyRevenue = calcRevenue(allAppointments.filter(a => new Date(a.appointmentTime) >= startOfYear));

    const todayAppsCount = allAppointments.filter(a => {
      const d = new Date(a.appointmentTime);
      return d >= startOfDay && d < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    }).length;

    // Recent Activity: Last 5 appointments
    const recentActivity = await db.select().from(appointments)
      .orderBy(desc(appointments.appointmentTime))
      .limit(5);

    return {
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      totalCustomers: activeCustomers.length,
      todayAppointments: todayAppsCount,
      recentActivity
    };
  }

  // Advanced Reporting
  async getReportStats(from: Date, to: Date): Promise<{
    summary: {
      totalRevenue: number;
      totalAppointments: number;
      averageOrderValue: number;
      newCustomers: number;
    };
    dailyTrend: { date: string; revenue: number; count: number }[];
    servicePerformance: { name: string; revenue: number; count: number }[];
    employeePerformance: { name: string; revenue: number; count: number }[];
  }> {
    const appointmentsInRange = await db.select().from(appointments)
      .where(and(
        gte(appointments.appointmentTime, from),
        lte(appointments.appointmentTime, to),
        eq(appointments.status, 'completed')
      ));

    const customersInRange = await db.select().from(customers)
      .where(and(
        gte(customers.createdAt, from),
        lte(customers.createdAt, to)
      ));

    // Summary
    const totalRevenue = appointmentsInRange.reduce((sum, app) => sum + (app.price || 0), 0);
    const totalAppointments = appointmentsInRange.length;
    const averageOrderValue = totalAppointments > 0 ? Math.round(totalRevenue / totalAppointments) : 0;

    // Daily Trend
    const trendMap = new Map<string, { revenue: number; count: number }>();
    appointmentsInRange.forEach(app => {
      const dateKey = app.appointmentTime.toISOString().split('T')[0]; // YYYY-MM-DD
      const current = trendMap.get(dateKey) || { revenue: 0, count: 0 };
      trendMap.set(dateKey, {
        revenue: current.revenue + (app.price || 0),
        count: current.count + 1
      });
    });

    // Sort trend by date
    const dailyTrend = Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Service Performance
    const allServices = await db.select().from(services);
    const serviceMap = new Map<string, { revenue: number; count: number }>();

    appointmentsInRange.forEach(app => {
      const serviceName = app.serviceType || "Bilinmiyor";
      const current = serviceMap.get(serviceName) || { revenue: 0, count: 0 };
      serviceMap.set(serviceName, {
        revenue: current.revenue + (app.price || 0),
        count: current.count + 1
      });
    });

    const servicePerformance = Array.from(serviceMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Employee Performance
    const allEmployees = await db.select().from(employees);
    const employeeMap = new Map<string, { revenue: number; count: number }>();

    appointmentsInRange.forEach(app => {
      let empName = "Atanmamış";
      if (app.employeeId) {
        const emp = allEmployees.find(e => e.id === app.employeeId);
        if (emp) empName = emp.name;
      }

      const current = employeeMap.get(empName) || { revenue: 0, count: 0 };
      employeeMap.set(empName, {
        revenue: current.revenue + (app.price || 0),
        count: current.count + 1
      });
    });

    const employeePerformance = Array.from(employeeMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      summary: {
        totalRevenue,
        totalAppointments,
        averageOrderValue,
        newCustomers: customersInRange.length
      },
      dailyTrend,
      servicePerformance,
      employeePerformance
    };
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const [settings] = await db.select().from(notificationSettings).limit(1);
    if (!settings) {
      // Create default if not exists
      const [newSettings] = await db.insert(notificationSettings).values({}).returning();
      return newSettings;
    }
    return settings;
  }

  async updateNotificationSettings(settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings> {
    const existing = await this.getNotificationSettings();
    const [updated] = await db.update(notificationSettings)
      .set(settings)
      .where(eq(notificationSettings.id, existing.id))
      .returning();
    return updated;
  }

  async getNotificationLogs(): Promise<NotificationLog[]> {
    return await db.select().from(notificationLogs).orderBy(desc(notificationLogs.sentAt)).limit(50);
  }

  async createNotificationLog(log: InsertNotificationLog): Promise<NotificationLog> {
    const [newLog] = await db.insert(notificationLogs).values(log).returning();
    return newLog;
  }
}

console.log("Initializing Storage...");
export const storage = new DatabaseStorage();
