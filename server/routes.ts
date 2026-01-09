import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Dashboard Stats ===
  app.get("/api/dashboard-stats", async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // === Customers ===
  app.get(api.customers.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const customers = await storage.getCustomers(search);
    res.json(customers);
  });

  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put(api.customers.update.path, async (req, res) => {
    try {
      const input = api.customers.update.input.parse(req.body);
      const customer = await storage.updateCustomer(Number(req.params.id), input);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      res.json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete(api.customers.delete.path, async (req, res) => {
    await storage.deleteCustomer(Number(req.params.id));
    res.status(204).send();
  });

  // === Appointments ===
  app.get(api.appointments.list.path, async (req, res) => {
    const customerId = req.query.customerId ? Number(req.query.customerId) : undefined;
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const appointments = await storage.getAppointments(customerId, from, to);
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      // Coerce dates if necessary
      const input = api.appointments.create.input.parse(req.body);
      const appointment = await storage.createAppointment(input);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put(api.appointments.update.path, async (req, res) => {
    try {
      const input = api.appointments.update.input.parse(req.body);
      const appointment = await storage.updateAppointment(Number(req.params.id), input);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
      res.json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete(api.appointments.delete.path, async (req, res) => {
    await storage.deleteAppointment(Number(req.params.id));
    res.status(204).send();
  });

  // === Services ===
  app.get(api.services.list.path, async (_req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.post(api.services.create.path, async (req, res) => {
    try {
      const input = api.services.create.input.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put(api.services.update.path, async (req, res) => {
    try {
      const input = api.services.update.input.parse(req.body);
      const service = await storage.updateService(Number(req.params.id), input);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      res.json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete(api.services.delete.path, async (req, res) => {
    await storage.deleteService(Number(req.params.id));
    res.status(204).send();
  });

  // === Employees ===
  app.get(api.employees.list.path, async (_req, res) => {
    const employees = await storage.getEmployees();
    res.json(employees);
  });

  app.post(api.employees.create.path, async (req, res) => {
    try {
      const input = api.employees.create.input.parse(req.body);
      const employee = await storage.createEmployee(input);
      res.status(201).json(employee);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put(api.employees.update.path, async (req, res) => {
    try {
      const input = api.employees.update.input.parse(req.body);
      const employee = await storage.updateEmployee(Number(req.params.id), input);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      res.json(employee);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete(api.employees.delete.path, async (req, res) => {
    await storage.deleteEmployee(Number(req.params.id));
    res.status(204).send();
  });

  // Reports
  app.get("/api/reports", async (req, res) => {
    try {
      const fromParam = req.query.from as string;
      const toParam = req.query.to as string;

      const to = toParam ? new Date(toParam) : new Date();
      const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

      const stats = await storage.getReportStats(from, to);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Notification Settings
  app.get("/api/settings/notifications", async (_req, res) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings/notifications", async (req, res) => {
    try {
      const settings = await storage.updateNotificationSettings(req.body);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  return httpServer;
}

async function seedDatabase() {
  const existingCustomers = await storage.getCustomers();
  if (existingCustomers.length === 0) {
    const c1 = await storage.createCustomer({
      fullName: "Ayşe Yılmaz",
      phoneNumber: "5551234567",
      email: "ayse@example.com",
      notes: "Saç boyasına alerjisi olabilir, test yap.",
    });
    const c2 = await storage.createCustomer({
      fullName: "Fatma Demir",
      phoneNumber: "5559876543",
      email: "fatma@example.com",
      notes: "Kısa saç kesimi seviyor.",
    });

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await storage.createAppointment({
      customerId: c1.id,
      serviceType: "Saç Kesimi",
      appointmentTime: now,
      status: "completed",
      price: 500,
      notes: "Memnun kaldı."
    });

    await storage.createAppointment({
      customerId: c1.id,
      serviceType: "Boya",
      appointmentTime: tomorrow,
      status: "scheduled",
      price: 1500,
      notes: "Dip boyası."
    });

    await storage.createAppointment({
      customerId: c2.id,
      serviceType: "Fön",
      appointmentTime: now,
      status: "scheduled",
      price: 200,
      notes: "Düğün için."
    });
  }
}
