import { Router } from "express"
import { getLeads, createLead, getLeadById, updateLead, deleteLead, getLeadStats, bulkInsertLeads } from "../controllers/leadController"
import { protect, authorize } from "../middleware/auth"

const router = Router()

// All lead routes require authentication
router.use(protect)

// GET /api/leads - Get all leads with pagination, search, filter, sort
router.get("/", getLeads)

// GET /api/leads/stats - Get lead statistics
router.get("/stats", getLeadStats)

// GET /api/leads/:id - Get single lead by ID
router.get("/:id", getLeadById)

// POST /api/leads - Create new lead
router.post("/", createLead)

// PUT /api/leads/:id - Update lead
router.put("/:id", updateLead)

// POST /api/leads/bulk - Bulk insert leads from Excel
router.post("/bulk", bulkInsertLeads)

// DELETE /api/leads/:id - Delete lead (admin only)
router.delete("/:id", deleteLead) //authorize("admin")

export default router
