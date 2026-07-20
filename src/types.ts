export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  status: "Active" | "Inactive" | "On Leave";
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export type Department = "All" | "Engineering" | "Design" | "Product" | "Marketing" | "Sales" | "HR" | "Finance";
export type StatusFilter = "All" | "Active" | "Inactive" | "On Leave";
