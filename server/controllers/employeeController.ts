import { Response } from "express";
import { EmployeeService } from "../services/employeeService.ts";
import { AuthenticatedRequest } from "../middleware/auth.ts";

export class EmployeeController {
  static async getAllEmployees(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, department, status } = req.query;

      const employees = await EmployeeService.getAll({
        search: search as string,
        department: department as string,
        status: status as string,
      });

      res.status(200).json({ employees });
    } catch (error) {
      console.error("Fetch employees error:", error);
      res.status(500).json({ message: "Internal server error retrieving employee list" });
    }
  }

  static async getEmployeeById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await EmployeeService.getById(id);

      if (!employee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }

      res.status(200).json({ employee });
    } catch (error) {
      console.error("Fetch employee by ID error:", error);
      res.status(500).json({ message: "Internal server error retrieving employee details" });
    }
  }

  static async createEmployee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, email, phone, department, designation, salary, status } = req.body;

      // Validation
      if (!name || !email || !phone || !department || !designation || salary === undefined) {
        res.status(400).json({ message: "All required fields must be provided" });
        return;
      }

      if (Number(salary) < 0) {
        res.status(400).json({ message: "Salary cannot be a negative value" });
        return;
      }

      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ message: "Please provide a valid email address" });
        return;
      }

      const employee = await EmployeeService.create({
        name,
        email,
        phone,
        department,
        designation,
        salary,
        status,
      });

      res.status(201).json({
        message: "Employee record created successfully",
        employee,
      });
    } catch (error: any) {
      console.error("Create employee error:", error);
      res.status(400).json({ message: error.message || "Failed to create employee record" });
    }
  }

  static async updateEmployee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, department, designation, salary, status } = req.body;

      // Validate salary if provided
      if (salary !== undefined && Number(salary) < 0) {
        res.status(400).json({ message: "Salary cannot be a negative value" });
        return;
      }

      // Validate email if provided
      if (email) {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({ message: "Please provide a valid email address" });
          return;
        }
      }

      const updated = await EmployeeService.update(id, {
        name,
        email,
        phone,
        department,
        designation,
        salary,
        status,
      });

      if (!updated) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }

      res.status(200).json({
        message: "Employee record updated successfully",
        employee: updated,
      });
    } catch (error: any) {
      console.error("Update employee error:", error);
      res.status(400).json({ message: error.message || "Failed to update employee record" });
    }
  }

  static async deleteEmployee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await EmployeeService.delete(id);

      if (!success) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }

      res.status(200).json({ message: "Employee record deleted successfully" });
    } catch (error) {
      console.error("Delete employee error:", error);
      res.status(500).json({ message: "Internal server error deleting employee record" });
    }
  }
}
