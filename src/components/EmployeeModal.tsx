import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Save, UserPlus, FileEdit } from "lucide-react";
import { Employee, Department } from "../types.ts";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => Promise<void>;
  employee?: Employee | null;
}

const DEPARTMENTS: Exclude<Department, "All">[] = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
];

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  employee,
}: EmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Engineering",
    designation: "",
    salary: "",
    status: "Active" as "Active" | "Inactive" | "On Leave",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        salary: employee.salary.toString(),
        status: employee.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "Engineering",
        designation: "",
        salary: "",
        status: "Active",
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation/Job Title is required";
    }

    if (!formData.salary.trim()) {
      newErrors.salary = "Salary is required";
    } else {
      const sal = Number(formData.salary);
      if (isNaN(sal) || sal < 0) {
        newErrors.salary = "Please enter a valid non-negative salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        salary: Number(formData.salary),
      });
      onClose();
    } catch (err: any) {
      setErrors({ global: err.message || "Failed to save employee" });
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = !!employee;

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="employee-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-none bg-[#0c0c0c] shadow-2xl border border-zinc-800 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-4.5 bg-[#0f0f0f]">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-none bg-zinc-900 border border-zinc-800 text-[#C5A059]">
                  {isEdit ? <FileEdit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-serif font-normal italic text-zinc-100 tracking-wide">
                    {isEdit ? "Edit Associate Profile" : "Register New Associate"}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    {isEdit ? "Update and verify administrative personnel data" : "Enroll an associate into active rosters"}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-modal"
                onClick={onClose}
                className="rounded-none p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.global && (
                <div className="p-3.5 bg-rose-950/25 border border-rose-900 text-rose-400 text-xs font-semibold rounded-none">
                  {errors.global}
                </div>
              )}

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="name-input" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Associate Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor Vance"
                    className={`w-full rounded-none border px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-hidden ${
                      errors.name
                        ? "border-rose-900 bg-rose-950/10 focus:border-rose-800"
                        : "border-zinc-800 bg-[#0f0f0f] text-zinc-200 placeholder-zinc-700 focus:border-[#C5A059]"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email-input" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Work Email
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@nexus.com"
                    className={`w-full rounded-none border px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-hidden ${
                      errors.email
                        ? "border-rose-900 bg-rose-950/10 focus:border-rose-800"
                        : "border-zinc-800 bg-[#0f0f0f] text-zinc-200 placeholder-zinc-700 focus:border-[#C5A059]"
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone-input" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone-input"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 012-3456"
                    className={`w-full rounded-none border px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-hidden ${
                      errors.phone
                        ? "border-rose-900 bg-rose-950/10 focus:border-rose-800"
                        : "border-zinc-800 bg-[#0f0f0f] text-zinc-200 placeholder-zinc-700 focus:border-[#C5A059]"
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.phone}</p>}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="dept-select" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Department
                  </label>
                  <select
                    id="dept-select"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-none border border-zinc-800 px-3.5 py-2.5 text-sm font-bold uppercase tracking-widest bg-[#0f0f0f] text-zinc-400 focus:outline-hidden focus:border-[#C5A059]"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label htmlFor="designation-input" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Designation / Role
                  </label>
                  <input
                    id="designation-input"
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Lead Architect"
                    className={`w-full rounded-none border px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-hidden ${
                      errors.designation
                        ? "border-rose-900 bg-rose-950/10 focus:border-rose-800"
                        : "border-zinc-800 bg-[#0f0f0f] text-zinc-200 placeholder-zinc-700 focus:border-[#C5A059]"
                    }`}
                  />
                  {errors.designation && <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.designation}</p>}
                </div>

                {/* Salary */}
                <div>
                  <label htmlFor="salary-input" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Annual Salary ($ USD)
                  </label>
                  <input
                    id="salary-input"
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 145000"
                    min="0"
                    className={`w-full rounded-none border px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-hidden ${
                      errors.salary
                        ? "border-rose-900 bg-rose-950/10 focus:border-rose-800"
                        : "border-zinc-800 bg-[#0f0f0f] text-zinc-200 placeholder-zinc-700 focus:border-[#C5A059]"
                    }`}
                  />
                  {errors.salary && <p className="mt-1 text-xs text-rose-400 font-semibold">{errors.salary}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status-select" className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Status
                  </label>
                  <select
                    id="status-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-none border border-zinc-800 px-3.5 py-2.5 text-sm font-bold uppercase tracking-widest bg-[#0f0f0f] text-zinc-400 focus:outline-hidden focus:border-[#C5A059]"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-900 mt-6">
                <button
                  id="btn-form-cancel"
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-5 py-3 rounded-none border border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-400 bg-[#0f0f0f] hover:bg-zinc-900 hover:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-form-save"
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C5A059] text-black text-[11px] font-bold uppercase tracking-wider px-6 py-3 rounded-none hover:bg-[#d6b57a] transition-colors inline-flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{submitting ? "Saving..." : isEdit ? "Save Changes" : "Register Associate"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
