import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const EMPLOYEES_FILE = path.join(DATA_DIR, "employees.json");

// Ensure data directory and files exist
export const initializeFileDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf8");
  }

  if (!fs.existsSync(EMPLOYEES_FILE)) {
    // Seed with a few realistic initial employees for a gorgeous visual experience out-of-the-box
    const initialEmployees = [
      {
        _id: "emp_1",
        name: "Alex Rivera",
        email: "alex.rivera@enterprise.com",
        phone: "+1 (555) 234-5678",
        department: "Engineering",
        designation: "Lead Frontend Engineer",
        salary: 115000,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "emp_2",
        name: "Samantha Chen",
        email: "samantha.chen@enterprise.com",
        phone: "+1 (555) 876-5432",
        department: "Design",
        designation: "Principal UI/UX Designer",
        salary: 105000,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "emp_3",
        name: "Marcus Vance",
        email: "marcus.vance@enterprise.com",
        phone: "+1 (555) 345-6789",
        department: "Product",
        designation: "Senior Product Manager",
        salary: 125000,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "emp_4",
        name: "Elena Rostova",
        email: "elena.rostova@enterprise.com",
        phone: "+1 (555) 456-7890",
        department: "Marketing",
        designation: "Growth Marketing Director",
        salary: 95000,
        status: "On Leave",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "emp_5",
        name: "Devon Lane",
        email: "devon.lane@enterprise.com",
        phone: "+1 (555) 567-8901",
        department: "Engineering",
        designation: "Junior DevOps Engineer",
        salary: 80000,
        status: "Inactive",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(initialEmployees, null, 2), "utf8");
  }
};

// Generic read/write helpers
export const readJsonFile = <T>(filePath: string): T[] => {
  try {
    initializeFileDb();
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

export const writeJsonFile = <T>(filePath: string, data: T[]): boolean => {
  try {
    initializeFileDb();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

export const getUsers = () => readJsonFile<any>(USERS_FILE);
export const saveUsers = (users: any[]) => writeJsonFile(USERS_FILE, users);

export const getEmployees = () => readJsonFile<any>(EMPLOYEES_FILE);
export const saveEmployees = (employees: any[]) => writeJsonFile(EMPLOYEES_FILE, employees);
