import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Employee, Department, StatusFilter } from "../types.ts";
import { apiFetch } from "../services/api.ts";
import EmployeeModal from "../components/EmployeeModal.tsx";
import ConfirmModal from "../components/ConfirmModal.tsx";
import {
  Users,
  Briefcase,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Mail,
  Phone,
  Database,
  Building,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState({ type: "file", connected: false });

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<Department>("All");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");

  // Modal control states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch employees and database status
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load health endpoint to see db state
      const health = await apiFetch("/health");
      setDbStatus(health.database);

      // Load employees list with active filters
      const data = await apiFetch(
        `/employees?search=${encodeURIComponent(searchQuery)}&department=${selectedDept}&status=${selectedStatus}`
      );
      setEmployees(data.employees || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError("Unable to sync database. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDept, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle employee CRUD saving
  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    try {
      if (selectedEmployee) {
        // Edit Operation
        await apiFetch(`/employees/${selectedEmployee._id}`, {
          method: "PUT",
          body: JSON.stringify(employeeData),
        });
      } else {
        // Create Operation
        await apiFetch("/employees", {
          method: "POST",
          body: JSON.stringify(employeeData),
        });
      }
      loadData();
    } catch (err: any) {
      throw new Error(err.message || "Failed to save employee profile.");
    }
  };

  // Handle employee deletion
  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    try {
      await apiFetch(`/employees/${selectedEmployee._id}`, {
        method: "DELETE",
      });
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to remove employee record.");
    }
  };

  // Open modal for editing
  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  // Open modal for creating new
  const handleCreateClick = () => {
    setSelectedEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Calculate Metrics
  const metrics = useMemo(() => {
    if (!employees.length) {
      return { total: 0, avgSalary: 0, activeRate: 0 };
    }
    const total = employees.length;
    const totalSalary = employees.reduce((acc, emp) => acc + emp.salary, 0);
    const avgSalary = Math.round(totalSalary / total);
    const activeCount = employees.filter((emp) => emp.status === "Active").length;
    const activeRate = Math.round((activeCount / total) * 100);

    return { total, avgSalary, activeRate };
  }, [employees]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div id="dashboard-wrapper" className="min-h-screen bg-[#050505] flex flex-col text-[#e5e5e5] pb-12 font-sans">
      {/* Top Header Navbar */}
      <nav id="top-navbar" className="sticky top-0 z-40 bg-[#080808] border-b border-[#1a1a1a] shadow-none backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-none bg-[#C5A059] text-black font-serif font-bold text-lg">
                N
              </div>
              <div>
                <span className="font-serif tracking-widest font-light text-[#C5A059] text-base">NEXUS STAFFSYNC</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 block leading-tight font-bold">Enterprise Directory</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* DB Indicator badge */}
              <div className="hidden sm:flex items-center space-x-2 bg-[#0f0f0f] border border-zinc-800 rounded-none px-3.5 py-1.5 text-xs font-semibold">
                <Database className={`h-3.5 w-3.5 ${dbStatus.connected ? "text-[#C5A059]" : "text-amber-500 animate-pulse"}`} />
                <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  {dbStatus.type === "mongodb" ? "MongoDB Online" : "Preview Sandbox Sync"}
                </span>
              </div>

              {/* User Identity info */}
              <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4">
                <div className="text-right">
                  <span className="font-semibold text-xs text-zinc-200 block">{user?.name}</span>
                  <span className="text-[9px] font-bold text-[#C5A059] block uppercase tracking-widest leading-tight">Admin Principal</span>
                </div>
                <button
                  id="btn-logout"
                  onClick={logout}
                  className="p-2 rounded-none text-zinc-500 hover:text-rose-500 hover:bg-zinc-900 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1 w-full space-y-6">
        
        {/* Banner with system status */}
        <div className="bg-[#0c0c0c] border border-zinc-800 text-zinc-200 rounded-none p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,#C5A059,transparent)] opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif font-normal italic tracking-tight text-zinc-100 md:text-3xl">Employee Registry</h1>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-xl uppercase tracking-wider">
                handcrafted administrative terminal executing live db persistence, dynamic multi-attribute filters, and custom secure auth loops.
              </p>
            </div>
            <button
              id="btn-add-employee-top"
              onClick={handleCreateClick}
              className="bg-[#C5A059] text-black text-[11px] font-bold uppercase tracking-wider px-6 py-3 rounded-none hover:bg-[#d6b57a] transition-colors inline-flex items-center space-x-2 w-fit cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Associate</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Employees */}
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-none p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Active Personnel</span>
              <span className="text-3xl font-serif italic text-[#C5A059] mt-1 block leading-none">{metrics.total}</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-600 mt-2 block font-bold">Total registered associates</span>
            </div>
            <div className="h-10 w-10 rounded-none bg-zinc-900 border border-zinc-800 text-[#C5A059] flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Average Salary */}
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-none p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Average Tenure Compensation</span>
              <span className="text-3xl font-serif italic text-zinc-200 mt-1 block leading-none">
                {formatCurrency(metrics.avgSalary)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-600 mt-2 block font-bold">Calculated dynamically</span>
            </div>
            <div className="h-10 w-10 rounded-none bg-zinc-900 border border-zinc-800 text-[#C5A059] flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Workforce health / active rate */}
          <div className="bg-[#0c0c0c] border border-zinc-800 rounded-none p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Workforce Utilization</span>
              <span className="text-3xl font-serif italic text-zinc-200 mt-1 block leading-none">{metrics.activeRate}%</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-600 mt-2 block font-bold">Percentage currently active</span>
            </div>
            <div className="h-10 w-10 rounded-none bg-zinc-900 border border-zinc-800 text-[#C5A059] flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Search & Filters Panel */}
        <div className="bg-[#0c0c0c] border border-zinc-800 rounded-none p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left search */}
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-600">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registry by name, email, or role..."
              className="w-full rounded-none border border-zinc-800 bg-[#0f0f0f] py-2.5 pl-10 pr-4 text-xs font-semibold uppercase tracking-wider text-zinc-200 placeholder-zinc-700 transition-colors focus:outline-hidden focus:border-[#C5A059]"
            />
          </div>

          {/* Right filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Registry Filters:</span>
            </div>

            {/* Department Filter */}
            <select
              id="dept-filter-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as Department)}
              className="rounded-none border border-zinc-800 bg-[#0f0f0f] px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors focus:outline-hidden focus:border-[#C5A059]"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>

            {/* Status Filter */}
            <select
              id="status-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
              className="rounded-none border border-zinc-800 bg-[#0f0f0f] px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors focus:outline-hidden focus:border-[#C5A059]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        {error && (
          <div className="p-4 bg-rose-950/25 border border-rose-900 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-none flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-[#0c0c0c] border border-zinc-800 rounded-none overflow-hidden shadow-none">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="h-8 w-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                Synchronizing Secure Registry...
              </p>
            </div>
          ) : employees.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-none bg-zinc-900 border border-zinc-800 text-zinc-600 mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-serif italic text-zinc-300">No Associates Indexed</h3>
              <p className="mt-2 text-xs text-zinc-500 max-w-sm mx-auto uppercase tracking-wider">
                no records found matching your filters. register a new personnel record to begin.
              </p>
              <button
                id="btn-empty-add"
                onClick={handleCreateClick}
                className="mt-5 bg-[#C5A059] text-black text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-none hover:bg-[#d6b57a] transition-colors inline-flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Associate Profile</span>
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f0f0f] border-b border-zinc-800 font-serif italic text-sm text-[#C5A059]">
                      <th className="px-6 py-4 font-normal">Associate Details</th>
                      <th className="px-6 py-4 font-normal">Department</th>
                      <th className="px-6 py-4 font-normal">Designation / Role</th>
                      <th className="px-6 py-4 font-normal">Salary (Annual)</th>
                      <th className="px-6 py-4 font-normal">Status</th>
                      <th className="px-6 py-4 font-normal text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-xs text-zinc-400">
                    {employees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-[#111111] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3.5">
                            <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-none bg-zinc-900 font-serif italic text-[#C5A059] text-sm border border-zinc-800">
                              {emp.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <span className="font-semibold text-zinc-200 font-serif text-sm block">{emp.name}</span>
                              <div className="flex items-center space-x-3 mt-1 text-[10px] text-zinc-500 font-mono">
                                <span className="flex items-center space-x-1.5">
                                  <Mail className="h-3 w-3 text-zinc-600" />
                                  <span>{emp.email}</span>
                                </span>
                                <span className="flex items-center space-x-1.5">
                                  <Phone className="h-3 w-3 text-zinc-600" />
                                  <span>{emp.phone}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-none bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-semibold uppercase tracking-wider">
                            <Building className="h-3 w-3 text-[#C5A059]" />
                            <span>{emp.department}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-300">{emp.designation}</td>
                        <td className="px-6 py-4 font-mono text-zinc-200">
                          {formatCurrency(emp.salary)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 border text-[9px] uppercase tracking-wider rounded-none ${
                              emp.status === "Active"
                                ? "border-[#C5A059]/30 text-[#C5A059] bg-transparent"
                                : emp.status === "On Leave"
                                ? "border-zinc-700 text-zinc-500 bg-transparent"
                                : "border-rose-950/40 text-rose-500 bg-transparent"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              id={`btn-edit-${emp._id}`}
                              onClick={() => handleEditClick(emp)}
                              className="p-1.5 rounded-none text-zinc-500 hover:text-[#C5A059] hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Edit Employee"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              id={`btn-delete-${emp._id}`}
                              onClick={() => handleDeleteClick(emp)}
                              className="p-1.5 rounded-none text-zinc-500 hover:text-rose-500 hover:bg-zinc-900 transition-colors cursor-pointer"
                              title="Delete Employee"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-zinc-900">
                {employees.map((emp) => (
                  <div key={emp._id} className="p-5 flex flex-col space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-none bg-zinc-900 font-serif italic text-[#C5A059] text-sm border border-zinc-800">
                          {emp.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <span className="font-serif text-sm font-semibold text-zinc-200 block leading-snug">{emp.name}</span>
                          <span className="text-[10px] text-zinc-500 block uppercase tracking-wider mt-0.5">{emp.designation}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 border text-[9px] uppercase tracking-wider rounded-none ${
                          emp.status === "Active"
                            ? "border-[#C5A059]/30 text-[#C5A059] bg-transparent"
                            : emp.status === "On Leave"
                            ? "border-zinc-700 text-zinc-500 bg-transparent"
                            : "border-rose-950/40 text-rose-500 bg-transparent"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-zinc-900 pt-3">
                      <div>
                        <span className="text-zinc-600 font-semibold uppercase tracking-wider text-[9px] block">Department</span>
                        <span className="font-bold text-zinc-400 mt-0.5 block">{emp.department}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 font-semibold uppercase tracking-wider text-[9px] block">Annual Compensation</span>
                        <span className="font-mono text-zinc-300 mt-0.5 block">{formatCurrency(emp.salary)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-600 font-semibold uppercase tracking-wider text-[9px] block">Contact</span>
                        <span className="font-mono text-zinc-400 mt-0.5 block break-all">{emp.email} • {emp.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-900">
                      <button
                        id={`btn-mobile-edit-${emp._id}`}
                        onClick={() => handleEditClick(emp)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 border border-zinc-800 rounded-none text-xs font-bold uppercase tracking-widest text-zinc-300 bg-transparent hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        id={`btn-mobile-delete-${emp._id}`}
                        onClick={() => handleDeleteClick(emp)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 border border-rose-950/40 rounded-none text-xs font-bold uppercase tracking-widest text-rose-500 bg-transparent hover:bg-zinc-900/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Employee Add/Edit Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Employee Record"
        message={`Are you absolutely sure you want to permanently delete the profile for ${selectedEmployee?.name}? This action cannot be undone.`}
        confirmText="Permanently Delete"
        cancelText="Keep Record"
      />
    </div>
  );
}
