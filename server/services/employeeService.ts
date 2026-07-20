import { Employee } from "../models/Employee.ts";
import { getEmployees, saveEmployees } from "./dbService.ts";
import { getDbStatus } from "../config/db.ts";

export class EmployeeService {
  static async getAll(filters: { search?: string; department?: string; status?: string }): Promise<any[]> {
    const { connected } = getDbStatus();
    const { search, department, status } = filters;

    if (connected) {
      const query: any = {};

      if (department) {
        query.department = department;
      }

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
        ];
      }

      return await (Employee as any).find(query).sort({ createdAt: -1 });
    } else {
      let employees = getEmployees();

      // Filter by department
      if (department && department !== "All") {
        employees = employees.filter((emp) => emp.department === department);
      }

      // Filter by status
      if (status && status !== "All") {
        employees = employees.filter((emp) => emp.status === status);
      }

      // Filter by search query
      if (search) {
        const queryLower = search.toLowerCase();
        employees = employees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(queryLower) ||
            emp.email.toLowerCase().includes(queryLower) ||
            emp.designation.toLowerCase().includes(queryLower) ||
            emp.phone.toLowerCase().includes(queryLower)
        );
      }

      // Sort by createdAt descending
      return employees.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  static async getById(id: string): Promise<any> {
    const { connected } = getDbStatus();

    if (connected) {
      return await (Employee as any).findById(id);
    } else {
      const employees = getEmployees();
      return employees.find((emp) => emp._id === id) || null;
    }
  }

  static async create(employeeData: any): Promise<any> {
    const { connected } = getDbStatus();

    if (connected) {
      return await (Employee as any).create(employeeData);
    } else {
      const employees = getEmployees();
      const emailLower = employeeData.email.toLowerCase();

      if (employees.some((emp) => emp.email.toLowerCase() === emailLower)) {
        throw new Error("An employee with this email already exists");
      }

      const newEmployee = {
        _id: "emp_" + Math.random().toString(36).substring(2, 11),
        name: employeeData.name,
        email: emailLower,
        phone: employeeData.phone,
        department: employeeData.department,
        designation: employeeData.designation,
        salary: Number(employeeData.salary),
        status: employeeData.status || "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      employees.push(newEmployee);
      saveEmployees(employees);
      return newEmployee;
    }
  }

  static async update(id: string, employeeData: any): Promise<any> {
    const { connected } = getDbStatus();

    if (connected) {
      return await (Employee as any).findByIdAndUpdate(id, employeeData, {
        new: true,
        runValidators: true,
      });
    } else {
      const employees = getEmployees();
      const index = employees.findIndex((emp) => emp._id === id);

      if (index === -1) {
        throw new Error("Employee not found");
      }

      // Email duplication check (excluding the current employee)
      const emailLower = employeeData.email.toLowerCase();
      if (employees.some((emp) => emp.email.toLowerCase() === emailLower && emp._id !== id)) {
        throw new Error("An employee with this email already exists");
      }

      const updatedEmployee = {
        ...employees[index],
        name: employeeData.name ?? employees[index].name,
        email: emailLower ?? employees[index].email,
        phone: employeeData.phone ?? employees[index].phone,
        department: employeeData.department ?? employees[index].department,
        designation: employeeData.designation ?? employees[index].designation,
        salary: employeeData.salary !== undefined ? Number(employeeData.salary) : employees[index].salary,
        status: employeeData.status ?? employees[index].status,
        updatedAt: new Date().toISOString(),
      };

      employees[index] = updatedEmployee;
      saveEmployees(employees);
      return updatedEmployee;
    }
  }

  static async delete(id: string): Promise<boolean> {
    const { connected } = getDbStatus();

    if (connected) {
      const result = await (Employee as any).findByIdAndDelete(id);
      return !!result;
    } else {
      const employees = getEmployees();
      const initialLength = employees.length;
      const filtered = employees.filter((emp) => emp._id !== id);

      if (filtered.length === initialLength) {
        return false;
      }

      saveEmployees(filtered);
      return true;
    }
  }
}
