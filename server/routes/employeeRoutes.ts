import { Router } from "express";
import { EmployeeController } from "../controllers/employeeController.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = Router();

// Protect all employee routes
router.use(authenticateToken as any);

router.get("/", EmployeeController.getAllEmployees as any);
router.get("/:id", EmployeeController.getEmployeeById as any);
router.post("/", EmployeeController.createEmployee as any);
router.put("/:id", EmployeeController.updateEmployee as any);
router.delete("/:id", EmployeeController.deleteEmployee as any);

export default router;
